exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') return { statusCode: 405, body: 'Method not allowed' };

  const { query, places, location } = JSON.parse(event.body || '{}');
  const ANTHROPIC_KEY = process.env.ANTHROPIC_API_KEY;

  const placesData = places.slice(0, 8).map(p => ({
    name: p.name,
    rating: p.rating,
    reviews: (p.reviews || []).slice(0, 3).map(r => r.text),
    address: p.formatted_address || p.vicinity,
    types: p.types,
    priceLevel: p.price_level,
    isOpen: p.opening_hours?.open_now,
    distance: p.distanceMeters
  }));

  const system = `Sos un motor de recomendación gastronómica para Argentina, especializado en Buenos Aires.
Recibís la búsqueda del usuario + datos reales de Google Places con reseñas reales.
Devolvé SOLO JSON válido, sin markdown, sin texto extra:
{
  "interpretation": "qué entendiste de la búsqueda en 1 línea corta",
  "results": [
    {
      "name": "nombre exacto del lugar tal como viene en los datos",
      "matchScore": 0-100,
      "aiInsight": "2-3 oraciones basadas en las reseñas reales. Explicá por qué matchea con la búsqueda. Sé específico y honesto.",
      "tags": ["tag1","tag2","tag3","tag4"]
    }
  ],
  "suggestions": [
    {
      "name": "Nombre de un lugar real y conocido de CABA que no esté en los resultados anteriores",
      "type": "tipo de lugar",
      "address": "dirección real aproximada",
      "rating": 4.5,
      "aiInsight": "Por qué este lugar podría interesarle al usuario basándote en su búsqueda. 2 oraciones.",
      "tags": ["tag1","tag2","tag3"],
      "matchScore": 75
    }
  ]
}
En "results": incluí solo los lugares que realmente matchean. Si no hay reseñas, decilo brevemente.
En "suggestions": agregá 2-3 lugares reales y conocidos de CABA que complementen la búsqueda — lugares que la IA recomienda por su conocimiento, aunque no estén en el radio exacto. Deben ser lugares reales que existan.
Los insights deben sentirse humanos y útiles, no genéricos.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-5',
        max_tokens: 1200,
        system,
        messages: [{ role: 'user', content: `Búsqueda: "${query}"\nUbicación: ${location}\n\nLugares encontrados:\n${JSON.stringify(placesData, null, 2)}` }]
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error?.message || 'Error API Anthropic');

    let raw = data.content.find(b => b.type === 'text')?.text || '{}';
    raw = raw.replace(/```json|```/g, '').trim();
    const parsed = JSON.parse(raw);

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(parsed)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};

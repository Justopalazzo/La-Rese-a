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

  const system = `Sos un motor de recomendación gastronómica para Argentina.
Recibís la búsqueda del usuario + datos reales de Google Places con reseñas reales.
Devolvé SOLO JSON válido, sin markdown, sin texto extra:
{
  "interpretation": "qué entendiste de la búsqueda en 1 línea corta",
  "results": [
    {
      "name": "nombre exacto del lugar tal como viene en los datos",
      "matchScore": 0-100,
      "aiInsight": "2-3 oraciones basadas en las reseñas reales. Explicá por qué matchea con la búsqueda. Sé específico, mencioná detalles reales.",
      "tags": ["tag1","tag2","tag3","tag4"]
    }
  ]
}
Incluí solo los lugares que realmente matchean. Si no hay reseñas, decilo brevemente.
El insight debe sentirse humano y útil, no genérico.`;

  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 1000,
        system,
        messages: [{ role: 'user', content: `Búsqueda: "${query}"\nUbicación: ${location}\n\nLugares:\n${JSON.stringify(placesData, null, 2)}` }]
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

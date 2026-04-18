exports.handler = async (event) => {
  const { place_id } = event.queryStringParameters || {};
  const GKEY = process.env.GOOGLE_API_KEY;

  const fields = 'name,rating,user_ratings_total,price_level,opening_hours,formatted_address,reviews,geometry,types,vicinity';
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=${fields}&key=${GKEY}&language=es`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};

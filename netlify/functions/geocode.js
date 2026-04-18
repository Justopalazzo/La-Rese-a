exports.handler = async (event) => {
  const { address } = event.queryStringParameters || {};
  if (!address) return { statusCode: 400, body: JSON.stringify({ error: 'Missing address' }) };

  const GKEY = process.env.GOOGLE_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${GKEY}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const { lat, lng } = data.results[0].geometry.location;
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lat, lng })
      };
    }
    return { statusCode: 200, body: JSON.stringify({ lat: -34.5883, lng: -58.4334 }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};

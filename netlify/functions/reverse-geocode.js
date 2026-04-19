exports.handler = async (event) => {
  const { lat, lng } = event.queryStringParameters || {};
  const GKEY = process.env.GOOGLE_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${GKEY}&language=es&result_type=neighborhood|sublocality|locality`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    if (data.results && data.results.length > 0) {
      const components = data.results[0].address_components;
      const neighborhood = components.find(c => c.types.includes('neighborhood') || c.types.includes('sublocality'))?.long_name;
      const city = components.find(c => c.types.includes('locality'))?.long_name;
      const address = neighborhood && city ? `${neighborhood}, ${city}` : data.results[0].formatted_address;
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ address })
      };
    }
    return { statusCode: 200, body: JSON.stringify({ address: `${lat}, ${lng}` }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};

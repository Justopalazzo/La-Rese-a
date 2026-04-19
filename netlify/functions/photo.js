exports.handler = async (event) => {
  const { ref, maxwidth } = event.queryStringParameters || {};
  if (!ref) return { statusCode: 400, body: 'Missing ref' };

  const GKEY = process.env.GOOGLE_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxwidth||400}&photo_reference=${ref}&key=${GKEY}`;

  try {
    const res = await fetch(url);
    if (!res.ok) return { statusCode: 404, body: 'Photo not found' };
    const buffer = await res.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const contentType = res.headers.get('content-type') || 'image/jpeg';
    return {
      statusCode: 200,
      headers: { 'Content-Type': contentType, 'Cache-Control': 'public, max-age=86400' },
      body: base64,
      isBase64Encoded: true
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: e.message }) };
  }
};

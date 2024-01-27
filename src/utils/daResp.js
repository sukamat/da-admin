export default function daResp({ status, body = '', contentType = 'application/json' }) {
  const headers = new Headers();
  headers.append('Access-Control-Allow-Origin', '*');
  headers.append('Access-Control-Allow-Methods', 'GET, PUT, POST, DELETE');
  headers.append('Access-Control-Allow-Headers', '*');
  headers.append('Content-Type', contentType);

  return new Response(body, { status, headers });
}

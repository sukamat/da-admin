import { decodeJwt } from 'jose';

async function setUser(user_id, headers, env) {
  const resp = await fetch(`${env.IMS_ORIGIN}/ims/profile/v1`, { headers });
  const json = await resp.json();

  console.log(json);

  const value = JSON.stringify({ email: json.email });
  await env.DA_AUTH.put(user_id, value);
  return value;
}

export default async function getUser(req, env) {
  const authHeader = req?.headers.get('authorization');
  if (authHeader) {
    const token = req.headers.get('authorization').split(' ').pop();
    if (!token) return;

    console.log(decodeJwt(token));

    const { user_id, created_at, expires_in } = decodeJwt(token);
    console.log(user_id, created_at, expires_in);

    const expires = Number(created_at) + Number(expires_in);
    const now = Math.floor(new Date().getTime() / 1000);

    if (expires >= now) {
      // Find the user
      let user = await env.DA_AUTH.get(user_id);
      // If not found, create them
      if (!user) user = await setUser(user_id, req.headers, env);
      // If something went wrong, die.
      if (!user) return;
      return JSON.parse(user);
    }
  }
  return { email: 'anonymous' };
}

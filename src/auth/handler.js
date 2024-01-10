import { decodeJwt } from 'jose';
import { logout } from '../utils/auth';

async function setUser(user_id, headers) {
  const resp = await fetch(`${env.IMS_ORIGIN}/ims/profile/v1`, { headers });
  const json = await resp.json();

  const value = JSON.stringify({ email: json.email });
  await env.DA_AUTH.put(user_id, value);
  return value;
}

export default async function authHandler(req, env, daCtx) {
  if (req.method === 'OPTIONS') return { body: '', status: 204 };
  if (req.method === 'GET') {
    const pathname = new URL(req.url).pathname;
    if (pathname.includes('logout')) {
      await logout(req, env);
      return { body: '', status: 204 };
    }

    return { body: JSON.stringify(daCtx), status: 200 };
  }
}

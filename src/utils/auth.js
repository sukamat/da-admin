import { decodeJwt } from 'jose';

function decodeHeader(req) {
  const authHeader = req.headers.get('authorization');
  if (authHeader) {
    const token = req.headers.get('authorization').split(' ').pop();
    if (!token) return;

    return decodeJwt(token);
  }
  return {};
}

async function setUser(user_id, expiration, headers, env) {
  const resp = await fetch(`${env.IMS_ORIGIN}/ims/profile/v1`, { headers });
  const json = await resp.json();

  console.log(json);

  const value = JSON.stringify({ email: json.email });
  await env.DA_AUTH.put(user_id, value, { expiration });
  return value;
}

export async function logout(req, env) {
  const { user_id } = decodeHeader(req);
  if (user_id) {
    await env.DA_AUTH.delete(user_id);
  }
}

export async function getUser(req, env) {
  const { user_id, created_at, expires_in } = decodeHeader(req);
  if (user_id) {
    const expires = Number(created_at) + Number(expires_in);
    const now = Math.floor(new Date().getTime() / 1000);

    if (expires >= now) {
      // Find the user
      let user = await env.DA_AUTH.get(user_id);
      // If not found, create them
      if (!user) user = await setUser(user_id, Math.floor(expires / 1000), req.headers, env);
      // If something went wrong, die.
      if (!user) return;
      return JSON.parse(user);
    }
  }
  return { email: 'anonymous' };
}

export async function isAuthorized(env, org, user) {
  if (!org) return true;

  const props = await env.DA_AUTH.get(`${org}-da-props`, { type: 'json' });
  if (!props) return true;

  const admins = props['admin.role.all'];
  if (!admins) return true;

  return admins.some((orgUser) => orgUser === user.email);
}

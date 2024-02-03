import { decodeJwt } from 'jose';

export async function setUser(user_id, expiration, headers, env) {
  const resp = await fetch(`${env.IMS_ORIGIN}/ims/profile/v1`, { headers });
  if (!resp.ok) {
    // Something went wrong - either with the connection or the token isn't valid
    // assume we are anon for now (but don't cache so we can try again next time)
    return;
  }
  const json = await resp.json();

  const value = JSON.stringify({ email: json.email });
  await env.DA_AUTH.put(user_id, value, { expiration });
  return value;
}

export async function getUsers(req, env) {
  const authHeader = req.headers?.get('authorization');
  const users = [];
  if (authHeader) {
    // We accept mutliple tokens as this might be a collab session
    for (let auth of authHeader.split(',')) {
      const token = auth.split(' ').pop();
      // If we have an empty token there was an anon user in the session
      if (!token || token.trim().length === 0) {
        users.push({ email: 'anonymous' });
      }
      const { user_id, created_at, expires_in } = decodeJwt(token);
      const expires = Number(created_at) + Number(expires_in);
      const now = Math.floor(new Date().getTime() / 1000);

      if (expires >= now) {
        // Find the user
        let user = await env.DA_AUTH.get(user_id);
        let headers = new Headers(req.headers);
        headers.delete('authorization');
        headers.set('authorization', `Bearer ${token}`);
        // If not found, create them
        if (!user) user = await setUser(user_id, Math.floor(expires / 1000), headers, env);
        // If something went wrong, be anon.
        if (!user) {
          users.push({ email: 'anonymous' });
        } else {
          users.push(JSON.parse(user));
        }
      } else {
        users.push({ email: 'anonymous' });
      }
    }
  } else {
    users.push({ email: 'anonymous' });
  }
  return users;
}

export async function isAuthorized(env, org, user) {
  if (!org) return true;

  const props = await env.DA_AUTH.get(`${org}-da-props`, { type: 'json' });
  if (!props) return true;

  const admins = props['admin.role.all'];
  if (!admins) return true;
  return admins.some((orgUser) => orgUser === user.email);
}

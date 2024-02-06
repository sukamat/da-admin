/*
 * Copyright 2024 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import { decodeJwt } from 'jose';

export async function setUser(userId, expiration, headers, env) {
  const resp = await fetch(`${env.IMS_ORIGIN}/ims/profile/v1`, { headers });
  if (!resp.ok) {
    // Something went wrong - either with the connection or the token isn't valid
    // assume we are anon for now (but don't cache so we can try again next time)
    return null;
  }
  const json = await resp.json();

  const value = JSON.stringify({ email: json.email });
  await env.DA_AUTH.put(userId, value, { expiration });
  return value;
}

export async function getUsers(req, env) {
  const authHeader = req.headers?.get('authorization');
  if (!authHeader) return [{ email: 'anonymous' }];
  const users = [];
  // We accept mutliple tokens as this might be a collab session
  for (const auth of authHeader.split(',')) {
    const token = auth.split(' ').pop();
    // If we have an empty token there was an anon user in the session
    if (!token || token.trim().length === 0) {
      users.push({ email: 'anonymous' });
    }
    const {
      user_id: userId,
      created_at: createdAt,
      expires_in: expiresIn,
    } = decodeJwt(token);
    const expires = Number(createdAt) + Number(expiresIn);
    const now = Math.floor(new Date().getTime() / 1000);

    if (expires >= now) {
      // Find the user
      let user = await env.DA_AUTH.get(userId);
      const headers = new Headers(req.headers);
      headers.delete('authorization');
      headers.set('authorization', `Bearer ${token}`);
      // If not found, create them
      if (!user) user = await setUser(userId, Math.floor(expires / 1000), headers, env);
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

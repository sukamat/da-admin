/**
 * @typedef {Object} DaCtx
 * @property {String} api - The API being requested.
 * @property {String} org - The organization or owner of the content.
 * @property {String} site - The site context.
 * @property {String} path - The path to the resource relative to the site.
 * @property {String} name - The name of the resource being requested.
 * @property {String} ext - The name of the extension.
 */

import getObject from '../storage/object/get';
import getUser from './auth';

async function getOrgProps(env, org, user) {
  if (org) {
    const { body } = await getObject(env, { org, key: '.props' });
    if (!body) return;

    const props = await new Response(body).json();
    const admins = props['admin.role.all'];
    if (!admins) return;

    const authorized = admins.some((orgUser) => orgUser === user.email);
    return { authorized };
  }
  return { authorized: true };
}

/**
 * Gets Dark Alley Context
 * @param {pathname} pathname
 * @returns {DaCtx} The Dark Alley Context.
 */
export async function getDaCtx(pathname, req, env) {
  const user = await getUser(req, env);

  // Santitize the string
  const lower = pathname.slice(1).toLowerCase();
  const sanitized = lower.endsWith('/') ? lower.slice(0, -1) : lower;

  // Get base details
  const [api, org, ...parts] = sanitized.split('/');

  // Get org properties
  // const { authorized } = await getOrgProps(env, org, user);

  // Set base details
  const daCtx = { api, org, user };

  // Sanitize the remaining path parts
  const path = parts.filter((part) => part !== '');
  const keyBase = path.join('/');

  // Get the final source name
  daCtx.filename = path.pop() || '';

  daCtx.site = path[0];

  // Handle folders and files under a site
  const split = daCtx.filename.split('.');
  daCtx.isFile = split.length > 1;
  if (daCtx.isFile) daCtx.ext = split.pop();
  daCtx.name = split.join('.');

  // Set keys
  daCtx.key = keyBase;
  daCtx.propsKey = `${daCtx.key}.props`;

  // Set paths for API consumption
  const aemParts = daCtx.site ? path.slice(1) : path;
  const aemPathBase = [...aemParts, daCtx.name].join('/');
  
  const daPathBase = [...path, daCtx.name].join('/');

  if (!daCtx.ext || daCtx.ext === 'html') {
    daCtx.pathname = `/${daPathBase}`;
    daCtx.aemPathname = `/${aemPathBase}`;
  } else {
    daCtx.pathname = `/${daPathBase}.${daCtx.ext}`;
    daCtx.aemPathname = `/${aemPathBase}.${daCtx.ext}`;
  }

  console.log(daCtx);

  return daCtx;
}

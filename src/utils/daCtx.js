/**
 * @typedef {Object} DaCtx
 * @property {String} api - The API being requested.
 * @property {String} org - The organization or owner of the content.
 * @property {String} site - The site context.
 * @property {String} path - The path to the resource relative to the site.
 * @property {String} name - The name of the resource being requested.
 * @property {String} ext - The name of the extension.
 */

/**
 * Gets Dark Alley Context
 * @param {pathname} pathname
 * @returns {DaCtx} The Dark Alley Context.
 */
export function getDaCtx(pathname) {
  // Santitize the string
  const lower = pathname.slice(1).toLowerCase();
  const sanitized = lower.endsWith('/') ? lower.slice(0, -1) : lower;

  // Get base details
  const [api, org, ...parts] = sanitized.split('/');

  // Set base details
  const daCtx = { api, org };

  // Sanitize the remaining path parts
  const path = parts.filter((part) => part !== '');

  // Determine the file name structure
  daCtx.name = path.slice(-1)[0];
  const split = daCtx.name.split('.');
  const hasExt = split.length > 1;

  // Set the base key
  const keyBase = `${path.join('/')}`;

  if (hasExt) {
    daCtx.key = keyBase;
    daCtx.ext = split.pop();
    daCtx.propsKey = `${keyBase}.props`;
  } else {
    daCtx.key = `${keyBase}.props`;
  }

  return daCtx;
}
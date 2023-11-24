export function getAdminCtx(pathname) {
  const sanitized = pathname.slice(1).toLowerCase();
  const [api, project, site, ...path] = sanitized.split('/');
  return { api, project, site, path: `/${path.join('/')}` };
}
import { getSource } from '../routes/source';
import getList from '../routes/list';
import { getProperties } from '../routes/properties';

function get404() {
  return { body: '', status: 404 };
}

function getRobots() {
  const body = `User-agent: *\nDisallow: /`;
  return { body, status: 200 };
}

export default async function getHandler({ env, daCtx }) {
  const { path } = daCtx;

  if (path.startsWith('/favicon.ico')) return get404();
  if (path.startsWith('/robots.txt')) return getRobots();

  if (path.startsWith('/source')) return getSource({ env, daCtx });
  if (path.startsWith('/list')) return getList({ env, daCtx });
  if (path.startsWith('/properties')) return getProperties();
}

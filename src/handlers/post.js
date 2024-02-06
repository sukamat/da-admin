import { postSource } from '../routes/source.js';
import { postProperties } from '../routes/properties.js';

export default async function postHandler({ req, env, daCtx }) {
  const { path } = daCtx;

  if (path.startsWith('/source')) return postSource({ req, env, daCtx });
  if (path.startsWith('/properties')) return postProperties({ req, env, daCtx });

  return undefined;
}

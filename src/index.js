import { getDaCtx } from './utils/daCtx';

// Handlers
import sourceHandler from './source/handler';
import docsHandler from './docs/handler';

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const daCtx = getDaCtx(url.pathname);

    if (daCtx.api === 'source')
      return sourceHandler(req, env, daCtx);

    if (daCtx.api === 'docs')
      return docsHandler();

    return new Response('Not supported.');
  },
};

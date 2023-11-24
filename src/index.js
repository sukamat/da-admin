import { getAdminCtx } from './utils/adminCtx';

// Handlers
import siteHandler from './site/handler';
import docsHandler from './docs/handler';

export default {
  async fetch(req, env, ctx) {
    const url = new URL(req.url);
    const adminCtx = getAdminCtx(url.pathname);

    if (adminCtx.api === 'site')
      return siteHandler(req, env, adminCtx);

    if (adminCtx.api === 'docs')
      return docsHandler();

    return new Response('Not supported.');
  },
};

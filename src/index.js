import { getDaCtx } from './utils/daCtx';

import sourceHandler from './source/handler';

import { get404, daResp, getRobots } from './responses';

export default {
  async fetch(req, env) {
    const pathname = new URL(req.url).pathname;

    if (pathname === '/favicon.ico') return get404();
    if (pathname === '/robots.txt') return getRobots();

    const daCtx = getDaCtx(pathname);

    if (pathname.startsWith('/source')) {
      const respProps = await sourceHandler(req, env, daCtx);
      return daResp(respProps);
    }

    if (pathname.startsWith('/list')) {
      // Do list things
    }

    return daResp({ body: '', status: 404 });
  },
};

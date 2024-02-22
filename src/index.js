import { getDaCtx } from './utils/daCtx';

import sourceHandler from './source/handler';
import listHandler from './list/handler';
import authHandler from './auth/handler';

import { get404, daResp, getRobots } from './responses';
import copyHandler from './copy/handler';

export default {
  async fetch(req, env) {
    const pathname = new URL(req.url).pathname;

    if (pathname === '/favicon.ico') return get404();
    if (pathname === '/robots.txt') return getRobots();

    const daCtx = await getDaCtx(pathname, req, env);

    if (pathname.startsWith('/source')) {
      const respProps = await sourceHandler(req, env, daCtx);
      return daResp(respProps);
    }

    if (pathname.startsWith('/list')) {
      const respProps = await listHandler(req, env, daCtx);
      return daResp(respProps);
    }

    if (pathname.startsWith('/copy')) {
      const respProps = await copyHandler(req, env, daCtx);
      return daResp(respProps);
    }

    if (pathname.startsWith('/auth')) {
      const respProps = await authHandler(req, env, daCtx);
      return daResp(respProps);
    }

    return daResp({ body: '', status: 404 });
  },
};

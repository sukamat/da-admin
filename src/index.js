import { getDaCtx } from './utils/daCtx';
import { isAuthorized } from './utils/auth';

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

    if (req.method === 'OPTIONS') return daResp({ status: 204 });

    const daCtx = await getDaCtx(pathname, req, env);

    if (!daCtx.authorized) {
      return daResp({ body: '', status: 401 });
    }

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

    if (pathname.startsWith('/props')) {
      // const value = JSON.stringify({"admin.role.all":["chris@millr.org"]});
      // const res = await env.DA_AUTH.put(`${daCtx.org}-da-props`, value);
      return daResp({ body: value, status: 201 });
    }

    return daResp({ body: '', status: 404 });
  },
};

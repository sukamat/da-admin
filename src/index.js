import getDaCtx from './utils/daCtx.js';
import daResp from './utils/daResp.js';

import getHandler from './handlers/get.js';
import postHandler from './handlers/post.js';
import deleteHandler from './handlers/delete.js';
import unkownHandler from './handlers/unkown.js';

export default {
  async fetch(req, env) {
    if (req.method === 'OPTIONS') return daResp({ status: 204 });

    const daCtx = await getDaCtx(req, env);
    if (!daCtx.authorized) return daResp({ status: 401 });

    let respObj;
    switch (req.method) {
      case 'GET':
        respObj = await getHandler({ env, daCtx });
        break;
      case 'PUT':
        respObj = await postHandler({ req, env, daCtx });
        break;
      case 'POST':
        respObj = await postHandler({ req, env, daCtx });
        break;
      case 'DELETE':
        respObj = await deleteHandler({ env, daCtx });
        break;
      default:
        respObj = unkownHandler();
    }

    return daResp(respObj);
  },
};

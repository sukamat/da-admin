export const CF_BASE = 'https://api.cloudflare.com/client/v4';

export const BASE_HEADER_OPTS = {
  'Content-Type': 'application/json',
};

export const DA_META_EXT = 'dameta';

export const ERR_HEADERS = new Headers({ ...BASE_HEADER_OPTS, status: 500 });
export const ERR_BODY = JSON.stringify({ error: 'Not supported.'});
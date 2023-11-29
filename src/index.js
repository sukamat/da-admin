import { Hono } from 'hono';
import { cors } from 'hono/cors';
import putSourceHandler from './source/put';

const app = new Hono();

app.use('/*', cors());

app.put('/source/*', async (c) => putSourceHandler(c));

app.get('/source/*', async (c) => getSourceHandler(c));

app.get('/*', async (c) => {
  return c.html('');
});

app.get('/docs*', async (c) => {
  return c.html('');
});

export default app;
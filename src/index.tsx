import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

import HomePage from './views/Home';
import SearchPage from './views/Search';
import DetailPage from './views/VideoDetail';

import {
  createInnertubeInstance,
  filterData,
  signToken,
  signVideoLink,
  vIdSchema
} from './utils';
import { createMiddleware } from 'hono/factory';
import { verify } from 'hono/jwt';
import { message } from './constants';

const app = new Hono<Env>();

// Routes
app.get('/', (c) => c.html(<HomePage />));

app.get('/search', async (c) => {
  const q = c.req.query('q');
  if (!q) return c.redirect('/');

  const yt = await createInnertubeInstance();
  const result = await yt.search(q, {
    type: 'video',
    sort_by: 'relevance'
  });

  return c.html(<SearchPage data={filterData(result)} q={q} />);
});

app.get(
  '/video/:id',
  zValidator(
    'param',
    z.object({
      id: vIdSchema
    })
  ),
  async (c) => {
    const host = c.req.header('host');
    const videoId = c.req.valid('param').id;

    await signVideoLink(videoId, c);
    const token = await signToken(videoId, c.env.JWT_SECRET);

    return c.html(
      <DetailPage url={`http://${host}/watch?v=${videoId}&t=${token}`} />
    );
  }
);

app.get(
  '/watch',
  createMiddleware(async (c, next) => {
    if (!c.req.header('range')) {
      await verify(c.req.query('t')!, c.env.JWT_SECRET).catch(() => {
        throw new HTTPException(401, {
          message: message.INVALID_TOKEN
        });
      });
    }

    await next();
  }),
  async (c) => {
    const videoId = c.req.query('v')!;

    const url =
      (await c.env.LINK.get(videoId, {
        cacheTtl: 60 * 60 * 1
      })) ?? (await signVideoLink(videoId, c));

    return fetch(url!, {
      headers: c.req.header()
    });
  }
);

app.get('/coreplayer', (c) => c.redirect(c.env.COREPLAYER_URL));

app.get('/robot.txt', (c) => c.text('User-agent: *\nAllow: /'));

// Error handling
app.notFound(() => {
  throw new HTTPException(404, { message: 'Not found' });
});

app.onError((err) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return new HTTPException(500, {
    message: 'Internal server error',
    cause: err
  }).getResponse();
});

export default app satisfies ExportedHandler<Env>;

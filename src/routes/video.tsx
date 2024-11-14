import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
import { z } from 'zod';
import { filterData, getDownloadLink, signToken, vIdSchema } from '../utils';
import MainLayout from '../views/MainLayout';
import SearchPage from '../views/Search';
import DetailPage from '../views/VideoDetail';

const router = new Hono<Env>();
class CacheMap extends Map {
  maxSize: number;

  constructor(maxSize: number) {
    super();
    this.maxSize = maxSize;
  }
}
const videoUrlCache = new CacheMap(10000);

router.get('/search', MainLayout, async (c) => {
  const q = c.req.query('q');
  if (!q) return c.redirect('/');

  const result = await c.get('innertube').search(q, {
    type: 'video',
    sort_by: 'relevance'
  });

  return c.render(<SearchPage data={filterData(result)} q={q} />, {
    title: 'Search results'
  });
});

router.get(
  '/video/:id',
  zValidator(
    'param',
    z.object({
      id: vIdSchema
    })
  ),
  MainLayout,
  async (c) => {
    const host = c.req.header('host');
    const { id } = c.req.valid('param');

    videoUrlCache.set(id, await getDownloadLink(id, c));
    const token = await signToken(id, process.env.JWT_SECRET!);

    return c.render(
      <DetailPage url={`http://${host}/watch?v=${id}&t=${token}`} />,
      {
        title: 'Video Detail'
      }
    );
  }
);

const EXCLUDED_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'cf-ray',
  'cf-connecting-ip'
]);

router.get(
  '/watch',
  async (c, next) => {
    try {
      const { t } = c.req.query();
      const range = c.req.header('range');

      if (!range && t) {
        await verify(t, process.env.JWT_SECRET!);
      }

      await next();
    } catch (error) {
      throw new HTTPException(401, {
        message:
          error instanceof Error ? error.message : 'Authentication failed'
      });
    }
  },
  async (c) => {
    const { v } = c.req.query();
    if (!v) {
      throw new HTTPException(400, { message: 'Missing video ID' });
    }

    try {
      const headers = new Headers({
        Connection: 'keep-alive'
      });

      for (const [key, value] of Object.entries(c.req.header())) {
        if (!EXCLUDED_HEADERS.has(key.toLowerCase()) && value) {
          headers.set(key, value);
        }
      }

      const response = await fetch(videoUrlCache.get(v), {
        headers
      });

      return response;
    } catch (error) {
      console.log(error);
    }
  }
);

export default router;

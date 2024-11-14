import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
import { z } from 'zod';
import { videoUrlCache } from '../core/cache';
import { EXCLUDED_HEADERS } from '../core/constants';
import { filterData, getDownloadLink, signToken, vIdSchema } from '../utils';
import MainLayout from '../views/MainLayout';
import SearchPage from '../views/Search';
import DetailPage from '../views/VideoDetail';

const router = new Hono<Env>();

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

router.get(
  '/watch',
  async (c, next) => {
    const { t } = c.req.query();
    const range = c.req.header('range');

    if (!t) {
      throw new HTTPException(400, { message: 'Missing token' });
    }

    // Only verify token if not a range request
    if (!range) {
      await verify(t, process.env.JWT_SECRET!).catch(() => {
        throw new HTTPException(401, { message: 'Invalid token' });
      });
    }

    await next();
  },
  async (c) => {
    const { v: videoId } = c.req.query();
    if (!videoId) {
      throw new HTTPException(400, { message: 'Missing video ID' });
    }

    const videoUrl = videoUrlCache.get(videoId);
    if (!videoUrl) {
      throw new HTTPException(404, { message: 'Video URL not found' });
    }

    try {
      const headers = new Headers({
        Connection: 'keep-alive'
      });

      // Copy allowed headers from request
      const requestHeaders = c.req.header();
      Object.entries(requestHeaders).forEach(([key, value]) => {
        const lowerKey = key.toLowerCase();
        if (!EXCLUDED_HEADERS.has(lowerKey) && value) {
          headers.set(key, value);
        }
      });

      const response = await fetch(videoUrl, { headers });

      return response;
    } catch (error) {
      console.error('Error streaming video:', error);
    }
  }
);

export default router;

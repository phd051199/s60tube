import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
import { z } from 'zod';
import { limiter, videoUrlCache } from '../core';
import { filterData, getDownloadLink, signToken, vIdSchema } from '../utils';
import MainLayout from '../views/MainLayout';
import SearchPage from '../views/Search';
import DetailPage from '../views/VideoDetail';

const router = new Hono<Env>();

router.get('/search', MainLayout, limiter, async (c) => {
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
  limiter,
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

router.get('/watch', async (c) => {
  const { t, v: videoId } = c.req.query();
  const range = c.req.header('range');

  if (!t || !videoId) {
    throw new HTTPException(400, {
      message: !t ? 'Missing token' : 'Missing video ID'
    });
  }

  if (!range) {
    await verify(t, process.env.JWT_SECRET!).catch(() => {
      throw new HTTPException(401, { message: 'Invalid token' });
    });
  }

  const videoUrl = videoUrlCache.get(videoId);
  if (!videoUrl) {
    throw new HTTPException(404, { message: 'Video URL not found' });
  }

  const headers = c.req.header();
  if (range) {
    headers['Range'] = range;
  }

  return fetch(videoUrl, { headers });
});

export default router;

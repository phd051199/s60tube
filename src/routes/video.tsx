import { zValidator } from '@hono/zod-validator';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import { HTTPException } from 'hono/http-exception';
import { verify } from 'hono/jwt';
import { z } from 'zod';
import { message } from '../constants';
import {
  createInnertube,
  filterData,
  getDownloadLink,
  getDownloadLinkInvidious,
  signToken,
  vIdSchema
} from '../utils';
import MainLayout from '../views/MainLayout';
import SearchPage from '../views/Search';
import DetailPage from '../views/VideoDetail';

const router = new Hono<Env>();

router.get('/search', MainLayout, async (c) => {
  const q = c.req.query('q');
  if (!q) return c.redirect('/');

  const innertube = await createInnertube({
    retrieve_player: false
  });
  const result = await innertube.search(q, {
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
    let invidious = '';

    try {
      await getDownloadLink(id, c);
    } catch (e) {
      invidious = await getDownloadLinkInvidious(id, c);
    }

    const token = await signToken(id, process.env.JWT_SECRET!);
    return c.render(
      <DetailPage
        url={`http://${host}/watch?v=${id}&t=${token}`}
        invidious={invidious}
      />,
      {
        title: 'Video Detail'
      }
    );
  }
);

router.get(
  '/watch',
  createMiddleware(async (c, next) => {
    const { t } = c.req.query();
    const range = c.req.header('range');
    if (!range) {
      await verify(t, process.env.JWT_SECRET!).catch(() => {
        throw new HTTPException(401, {
          message: message.INVALID_TOKEN
        });
      });
    }
    await next();
  }),
  async (c) => {
    const { v } = c.req.query();
    const url = await Bun.file(`links/${v}`).text();

    const response = await Bun.fetch(url, {
      headers: c.req.header()
    });

    console.log(response);

    return response;
  }
);

export default router;

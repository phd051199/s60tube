import { serve } from '@hono/node-server';
import 'dotenv/config';
import { Hono } from 'hono';
import Innertube from 'youtubei.js';
import { useErrorHandler } from './exception';
import home from './routes/home';
import video from './routes/video';

const app = new Hono<Env>();

const run = async () => {
  const innertube = await Innertube.create({
    lang: 'vi',
    location: 'VN',
    timezone: 'Asia/Ho_Chi_Minh'
  });

  app.use(async (c, next) => {
    c.set('innertube', innertube);
    await next();
  });

  app.route('/', home);
  app.route('/', video);
  app.get('/proxy', (c) =>
    fetch(c.req.query('url')!, {
      headers: c.req.header()
    })
  );
  app.get('/coreplayer', (c) => c.redirect(process.env.COREPLAYER_URL!));

  useErrorHandler(app);

  serve({
    fetch: app.fetch,
    port: 3003
  });
};

run();

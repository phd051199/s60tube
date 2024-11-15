import { serve } from '@hono/node-server';
import 'dotenv/config';
import { Hono } from 'hono';
import { compress } from 'hono/compress';
import Innertube, { Log, UniversalCache } from 'youtubei.js';
import { customLogger, useErrorHandler } from './core';
import home from './routes/home';
import video from './routes/video';

const app = new Hono<Env>();

const run = async () => {
  // Create innertube instance
  const innertube = await Innertube.create({
    lang: 'vi',
    location: 'VN',
    timezone: 'Asia/Ho_Chi_Minh',
    cache: new UniversalCache(true)
  });
  Log.setLevel(Log.Level.ERROR, Log.Level.WARNING);

  // Middleware
  app.use(compress());
  app.use(async (c, next) => {
    customLogger(c);
    await next();
  });
  app.use(async (c, next) => {
    c.set('innertube', innertube);
    await next();
  });

  // Routes
  app.route('/', home);
  app.route('/', video);
  app.get('/proxy', (c) =>
    fetch(c.req.query('url')!, {
      headers: c.req.header()
    })
  );
  app.get('/coreplayer', (c) => c.redirect(process.env.COREPLAYER_URL!));

  // Error handler
  useErrorHandler(app);

  // Run server
  serve({
    fetch: app.fetch,
    port: 3003
  });
};

run();

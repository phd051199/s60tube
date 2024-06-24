import { Hono } from 'hono/tiny';
import { HTTPException } from 'hono/http-exception';
import { validator } from 'hono/validator';
import { Innertube } from 'youtubei.js/cf-worker';

import HomePage from './views/Home';
import SearchPage from './views/Search';
import DetailPage from './views/VideoDetail';
import reject from 'lodash/reject';
import get from 'lodash/get';

const app = new Hono<Env>();

const idValidator = validator('query', (value, c) => {
  if (!value.v) return c.text('Missing video ID', 400);
});

// Routes
app.get('/', (c) => c.html(<HomePage />));

app.get('/search', async (c) => {
  const q = c.req.query('q');
  if (!q) return c.redirect('/');

  const yt = await Innertube.create({
    lang: 'vi',
    location: 'VN'
  });

  const result = await yt.search(q, {
    type: 'video',
    sort_by: 'relevance'
  });
  const data = reject(
    result.videos,
    (item) =>
      !get(item, 'duration.seconds') ||
      get(item, 'type').includes('Reel') ||
      get(item, 'title.text', '').includes('#short')
  );

  return c.html(<SearchPage data={data} q={q} />);
});

app.get('/video/:id', (c) => {
  const url = `http://${c.req.header('host')}/watch?v=${c.req.param('id')}`;
  return c.html(<DetailPage url={url} />);
});

app.get('/info', idValidator, async (c) => {
  const yt = await Innertube.create({
    lang: 'vi',
    location: 'VN'
  });

  const info = await yt.getBasicInfo(c.req.query('v')!);

  return c.json(info);
});

app.get('/watch', idValidator, async (c) => {
  const yt = await Innertube.create({
    lang: 'vi',
    location: 'VN'
  });

  const streaming = await yt.getStreamingData(c.req.query('v')!, {
    type: 'video+audio',
    quality: '360p'
  });
  const url = streaming.decipher(yt.session.player);

  if (!url) {
    return c.text('Video not found', 404);
  }
  return fetch(url, {
    headers: c.req.header()
  });
});

app.get('/robot.txt', (c) => c.text('User-agent: *\nAllow: /'));

// Error handling
app.notFound((c) => c.text('Not Found', 404));
app.onError((err, c) => {
  if (err instanceof HTTPException) {
    return err.getResponse();
  }
  return c.text(String(err), 500);
});

export default app satisfies ExportedHandler<Env>;

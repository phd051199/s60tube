import { Hono } from 'hono';
import { useErrorHandler } from './exception';
import home from './routes/home';
import video from './routes/video';

const app = new Hono<Env>();

app.route('/', home);
app.route('/', video);
app.get('/proxy', (c) =>
  fetch(c.req.query('url')!, {
    headers: c.req.header()
  })
);
app.get('/coreplayer', (c) => c.redirect(c.env.COREPLAYER_URL));
app.get('/robot.txt', (c) => c.text('User-agent: *\nAllow: /'));

useErrorHandler(app);

export default app satisfies ExportedHandler<Env>;

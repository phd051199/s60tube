import { Hono } from 'hono';
import MainLayout from '../views/MainLayout';
import HomePage from '../views/Home';

const router = new Hono<Env>();

router.get('/', MainLayout, (c) =>
  c.render(<HomePage />, {
    title: 'Home'
  })
);

export default router;

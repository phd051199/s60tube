import { Hono } from 'hono';
import HomePage from '../views/Home';
import MainLayout from '../views/MainLayout';

const router = new Hono<Env>();

router.get('/', MainLayout, (c) =>
  c.render(<HomePage />, {
    title: 'Home'
  })
);

export default router;

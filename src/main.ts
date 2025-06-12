import { Hono } from "hono";
const app = new Hono<Env>();
app.get('/', (c) => c.redirect('https://s60tube.io.vn'));

Deno.serve(app.fetch);

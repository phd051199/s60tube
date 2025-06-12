import { Hono } from "hono";
import { proxy } from "hono/proxy";
import { HTTPException } from "hono/http-exception";

const app = new Hono<Env>();
app.get("/", (c) => c.redirect("https://s60tube.io.vn"));

app.all("/proxy", async (c) => {
  let url = c.req.header("x-url") || c.req.query("url") || c.req.query("u");

  if (!url) {
    throw new HTTPException(404, {
      message: "Missing required 'url' parameter",
    });
  }

  return proxy(decodeURIComponent(url), c.req);
});

Deno.serve(app.fetch);

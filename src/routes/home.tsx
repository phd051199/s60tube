import { Hono } from "hono";
import { cache } from "hono/cache";

import HomePage from "../../views/Home.tsx";
import MainLayout from "../../views/MainLayout.tsx";
import { Env } from "../types.ts";

const router = new Hono<Env>();

router.get(
  "/",
  cache({
    cacheName: "home-cache",
    cacheControl: "max-age=86400",
    wait: true,
  }),
  MainLayout,
  (c) => c.render(<HomePage />),
);

export default router;

import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { videoIdSchema } from "../core/index.ts";
import { Env } from "../types.ts";
import { filterData, getVideoInfo } from "../utils/index.ts";

import MainLayout from "../../views/MainLayout.tsx";
import SearchPage from "../../views/Search.tsx";
import DetailPage from "../../views/VideoDetail.tsx";

const router = new Hono<Env>();

router.get("/search", MainLayout, async (c) => {
  const q = c.req.query("q");
  if (!q) return c.redirect("/");

  const result = await c.get("innertube").search(q, {
    sort_by: "relevance",
  });

  return c.render(<SearchPage data={filterData(result)} q={q} />);
});

router.get(
  "/video/:id",
  zValidator("param", videoIdSchema),
  MainLayout,
  async (c) => {
    const { id } = c.req.valid("param");
    const { format } = await getVideoInfo(c, id);
    const proxyUrl = `http://ytb-prx.dph.workers.dev/videoplayback?v=${id}`;
    return c.render(<DetailPage url={proxyUrl} format={format} />);
  },
);

export default router;

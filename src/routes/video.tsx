import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { videoIdSchema } from "../core/index.ts";
import { filterData, tryGetVideoInfo } from "../utils/index.ts";
import { Env } from "../types.ts";

import MainLayout from "../../views/MainLayout.tsx";
import SearchPage from "../../views/Search.tsx";
import DetailPage from "../../views/VideoDetail.tsx";
import { HTTPException } from "hono/http-exception";

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

    const { format, fromCFWorker } = await tryGetVideoInfo(c, id);
    const version = fromCFWorker ? "v2" : "v1";

    const proxyUrl = `http://${
      Deno.env.get("YTB_PROXY_URL")
    }/${version}/watch?v=${id}`;

    return c.render(
      <DetailPage
        url={proxyUrl}
        format={format}
      />,
    );
  },
);

router.get("/watch", async (c) => {
  const { v } = c.req.query();

  if (!v) {
    throw new HTTPException(400, {
      message: "Missing video ID",
    });
  }

  const videoUrl = await c.get("kv").get([v]);

  if (!videoUrl.value) {
    throw new HTTPException(404, { message: "Video URL not found" });
  }

  return fetch(videoUrl.value as string, {
    headers: c.req.header(),
  });
});

export default router;

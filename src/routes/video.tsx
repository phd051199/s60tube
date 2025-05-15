import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { videoIdSchema } from "../core/index.ts";
import { filterData, getDownloadLink, saveVideoUrl } from "../utils/index.ts";
import { Env } from "../types.ts";

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
    const { url, format } = await getDownloadLink(id, c).catch((e) => {
      console.error(e);
      throw e;
    });

    await saveVideoUrl(id, url);

    return c.render(
      <DetailPage
        url={`http://${Deno.env.get("YTB_PROXY_URL")}/v2/watch?v=${id}`}
        format={format}
      />,
    );
  },
);

export default router;

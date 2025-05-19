import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { limiter, videoIdSchema } from "../core/index.ts";
import { Env } from "../types.ts";
import { filterData, getVideoInfo } from "../utils/index.ts";

import MainLayout from "../../views/MainLayout.tsx";
import SearchPage from "../../views/Search.tsx";
import DetailPage from "../../views/VideoDetail.tsx";

const router = new Hono<Env>();

router.get("/search", MainLayout, async (c) => {
  const q = c.req.query("q");
  if (!q) return c.redirect("/");

  const page = parseInt(c.req.query("page") || "1", 10);
  const itemsPerPage = 10;

  const result = await c.get("innertube").search(q, {
    sort_by: "relevance",
  });

  const filteredData = filterData(result);
  const totalItems = filteredData.length;

  // Calculate pagination bounds
  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  // Slice the data for the current page
  const paginatedData = filteredData.slice(startIndex, endIndex);

  return c.render(
    <SearchPage
      data={paginatedData}
      q={q}
      pagination={{
        currentPage: page,
        totalItems,
        itemsPerPage,
        baseUrl: `/search?q=${encodeURIComponent(q)}`,
      }}
    />,
  );
});

router.get(
  "/video/:id",
  limiter,
  zValidator("param", videoIdSchema),
  MainLayout,
  async (c) => {
    const { id } = c.req.valid("param");
    const { format } = await getVideoInfo(c, id);

    return c.render(
      <DetailPage
        url={`http://ytb-prx.dph.workers.dev/videoplayback?v=${id}`}
        format={format}
      />,
    );
  },
);

export default router;

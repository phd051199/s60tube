import { zValidator } from "@hono/zod-validator";
import { Hono } from "hono";

import { limiter, videoIdSchema } from "../core/index.ts";
import { Env } from "../types.ts";
import {
  createSessionCache,
  filterData,
  getVideoInfo,
} from "../utils/index.ts";

import MainLayout from "../../views/MainLayout.tsx";
import SearchPage from "../../views/Search.tsx";
import DetailPage from "../../views/VideoDetail.tsx";

type SearchCacheData = {
  paginatedData: any[];
  totalItems: number;
};

const searchCache = createSessionCache<SearchCacheData>(5 * 60 * 1000);

const router = new Hono<Env>();

router.get("/search", MainLayout, async (c) => {
  const q = c.req.query("q");
  if (!q) return c.redirect("/");

  const page = parseInt(c.req.query("page") || "1", 10);
  const itemsPerPage = 10;
  const cacheKey = `search:${q}:${page}`;

  const cachedData = searchCache.get(cacheKey);
  if (cachedData) {
    return c.render(
      <SearchPage
        data={cachedData.paginatedData}
        q={q}
        pagination={{
          currentPage: page,
          totalItems: cachedData.totalItems,
          itemsPerPage,
          baseUrl: `/search?q=${encodeURIComponent(q)}`,
        }}
      />,
    );
  }

  const result = await c.get("innertube").search(q, {
    sort_by: "relevance",
  });

  const filteredData = filterData(result);
  const totalItems = filteredData.length;

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const paginatedData = filteredData.slice(startIndex, endIndex);

  searchCache.set(cacheKey, { paginatedData, totalItems });

  c.header("Cache-Control", "public, max-age=300");

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

    c.header("Cache-Control", "public, max-age=3600");

    return c.render(
      <DetailPage
        url={`http://ytb-prx.dph.workers.dev/videoplayback?v=${id}`}
        format={format}
      />,
    );
  },
);

export default router;

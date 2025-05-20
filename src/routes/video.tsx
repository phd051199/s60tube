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
  allFilteredData: any[];
  totalItems: number;
};

const searchCache = createSessionCache<SearchCacheData>(5 * 60 * 1000);
const router = new Hono<Env>();

router.get("/search", MainLayout, async (c) => {
  const q = c.req.query("q");
  if (!q) return c.redirect("/");

  const page = parseInt(c.req.query("page") || "1", 10);
  const itemsPerPage = 10;
  const cacheKey = `search:${q}`;

  const startIndex = (page - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;

  const cachedData = searchCache.get(cacheKey);
  if (cachedData) {
    const paginatedData = cachedData.allFilteredData.slice(
      startIndex,
      endIndex
    );

    return c.render(
      <SearchPage
        data={paginatedData}
        q={q}
        pagination={{
          currentPage: page,
          totalItems: cachedData.totalItems,
          itemsPerPage,
          baseUrl: `/search?q=${encodeURIComponent(q)}`,
        }}
      />
    );
  }

  const result = await c.get("innertube").search(q, {
    sort_by: "relevance",
  });

  const filteredData = filterData(result);
  const totalItems = filteredData.length;

  searchCache.set(cacheKey, {
    allFilteredData: filteredData,
    totalItems,
  });

  const paginatedData = filteredData.slice(startIndex, endIndex);

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
    />
  );
});

router.get(
  "/video/:id",
  limiter,
  zValidator("param", videoIdSchema),
  MainLayout,
  async (c) => {
    try {
      const { id } = c.req.valid("param");
      const { format } = await getVideoInfo(c, id).catch();

      c.header("Cache-Control", "public, max-age=300");

      return c.render(
        <DetailPage
          url={`http://stream.dph.io.vn/videoplayback?v=${id}`}
          format={format}
        />
      );
    } catch {
      return c.text(
        `YT has restricted this IP address.
         Please try again in a few hours.`,
        503
      );
    }
  }
);

export default router;

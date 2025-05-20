import { Hono } from "hono";
import { etag } from "hono/etag";
import { poweredBy } from "hono/powered-by";
import { Innertube, Log } from "youtubei.js/cf-worker";

import { customLogger, useErrorHandler } from "./core/index.ts";
import { Env } from "./types.ts";

import homeRouter from "./routes/home.tsx";
import videoRouter from "./routes/video.tsx";
import { fetchFunction } from "./utils/index.ts";

let innertubeInstance: Innertube | null = null;

async function getInnertubeClient() {
  if (!innertubeInstance) {
    innertubeInstance = await Innertube.create({
      lang: "en",
      location: "VN",
      fetch: fetchFunction,
    });
    Log.setLevel(Log.Level.ERROR);
  }
  return innertubeInstance;
}

const app = new Hono<Env>();
const innertube = await getInnertubeClient();

app.use(etag(), poweredBy());

app.use(async (c, next) => {
  if (Deno.env.get("DENO_ENV") !== "production") {
    customLogger(c);
  }

  c.set("innertube", innertube);

  c.header("X-Content-Type-Options", "nosniff");
  c.header("Referrer-Policy", "no-referrer");

  await next();

  if (!c.res.headers.get("Cache-Control")) {
    if (c.req.path === "/") {
      c.header("Cache-Control", "public, max-age=86400");
    } else if (c.req.path.includes("/static/")) {
      c.header("Cache-Control", "public, max-age=86400");
    } else {
      c.header("Cache-Control", "public, max-age=60");
    }
  }
});

app.get("/channel/:id", async (c) => {
  const {
    payload: { browseId: channelId },
  } = await c
    .get("innertube")
    .resolveURL(`https://www.youtube.com/@${c.req.param("id")}`);

  const result = await c.get("innertube").getChannel(channelId);

  return c.json(result);
});

app.route("/", homeRouter);
app.route("/", videoRouter);

useErrorHandler(app);

Deno.serve(app.fetch);

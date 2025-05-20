import { Hono } from "hono";
import { etag } from "hono/etag";
import { createMiddleware } from "hono/factory";
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

const innertubeMiddleware = (innertube: Innertube) => {
  return createMiddleware(async (c, next) => {
    if (Deno.env.get("DENO_ENV") !== "production") {
      customLogger(c);
    }

    c.set("innertube", innertube);
    c.header("X-Content-Type-Options", "nosniff");
    c.header("Referrer-Policy", "no-referrer");

    await next();
  });
};

app.use(etag(), poweredBy(), innertubeMiddleware(innertube));

app.route("/", homeRouter);
app.route("/", videoRouter);

useErrorHandler(app);

Deno.serve(app.fetch);

import { Hono } from "hono";
import { Innertube, Log } from "youtubei.js/cf-worker";

import { customLogger, useErrorHandler } from "./core/index.ts";
import { Env } from "./types.ts";

import homeRouter from "./routes/home.tsx";
import videoRouter from "./routes/video.tsx";
import { fetchFunction } from "./utils/index.ts";

const app = new Hono<Env>();
const innertube = await Innertube.create({
  lang: "en",
  location: "VN",
  fetch: fetchFunction,
  generate_session_locally: false,
});

Log.setLevel(Log.Level.ERROR);

app.use(async (c, next) => {
  customLogger(c);
  c.set("innertube", innertube);
  await next();
});

app.route("/", homeRouter);
app.route("/", videoRouter);

useErrorHandler(app);

Deno.serve(app.fetch);

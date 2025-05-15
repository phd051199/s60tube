import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { Innertube, Log } from "youtubei.js/cf-worker";

import { customLogger, useErrorHandler } from "./core/index.ts";
import { Env } from "./types.ts";

import homeRouter from "./routes/home.tsx";
import videoRouter from "./routes/video.tsx";
import { fetchFunction, generatePoToken } from "./utils/index.ts";

const app = new Hono<Env>();
const kv = await Deno.openKv();
const { poToken, visitorData } = generatePoToken();

const innertube = await Innertube.create({
  po_token: poToken,
  visitor_data: visitorData,
  generate_session_locally: true,
});

const innertubeCFWorker = await Innertube.create({
  po_token: poToken,
  visitor_data: visitorData,
  generate_session_locally: true,
  fetch: fetchFunction,
});

Log.setLevel(Log.Level.ERROR);

app.use(async (c, next) => {
  customLogger(c);
  c.set("innertube", innertube);
  c.set("innertubeCFWorker", innertubeCFWorker);
  c.set("kv", kv);
  await next();
});

app.use("/static/*", serveStatic({ root: "./" }));
app.get("/robots.txt", serveStatic({ path: "./static/robots.txt" }));

app.route("/", homeRouter);
app.route("/", videoRouter);

useErrorHandler(app);

Deno.serve(app.fetch);

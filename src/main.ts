import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import kvRouter from "./routes/kv.ts";
import homeRouter from "./routes/home.tsx";
import { cors } from "hono/cors";
import { useErrorHandler } from "./core/index.ts";
import { Env } from "./types.ts";
import Innertube from "youtubei.js";
import videoRouter from "./routes/video.tsx";

const app = new Hono<Env>();
const kv = await Deno.openKv();

const innertube = await Innertube.create({
  lang: "vi",
  location: "VN",
  timezone: "Asia/Ho_Chi_Minh",
  generate_session_locally: true,
});

app.use("*", cors());

app.use(async (c, next) => {
  c.set("innertube", innertube);
  c.set("kv", kv);
  await next();
});

app.use("/static/*", serveStatic({ root: "./" }));
app.get("/robots.txt", serveStatic({ path: "./static/robots.txt" }));

app.route("/kv", kvRouter);
app.route("/", homeRouter);
app.route("/", videoRouter);

useErrorHandler(app);

Deno.serve(app.fetch);

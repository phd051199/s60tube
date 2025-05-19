import { Context } from "hono";
import { getConnInfo } from "hono/deno";

export const customLogger = (c: Context) => {
  console.log(
    "Request received - method: %s, path: %s, query: %o, userAgent: %s, ip: %s",
    c.req.method,
    c.req.path,
    c.req.query(),
    c.req.header("user-agent"),
    getConnInfo(c).remote.address,
  );
};

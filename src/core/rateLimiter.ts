import { rateLimiter } from "hono-rate-limiter";
import { getConnInfo } from "hono/deno";

export const limiter = rateLimiter({
  windowMs: 3 * 1000,
  limit: 1,
  keyGenerator: (c) => getConnInfo(c).remote.address || randomString(),
});

const randomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

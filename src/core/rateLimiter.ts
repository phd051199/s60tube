import { rateLimiter } from "hono-rate-limiter";

export const limiter = rateLimiter({
  windowMs: 10 * 1000,
  limit: 5,
  keyGenerator: (c) => c.req.header("x-forwarded-for")!,
});

import { rateLimiter } from "hono-rate-limiter";
import { getConnInfo } from "hono/deno";

export const limiter = rateLimiter({
  windowMs: 10 * 1000,
  limit: 5,
  standardHeaders: true,
  keyGenerator: (c) => {
    const ip = getConnInfo(c).remote.address;
    if (ip) return ip;

    const ua = c.req.header("user-agent") || "";
    return hashCode(ua) + randomString();
  },
});

const randomString = () => {
  return Math.random().toString(36).substring(2, 8);
};

const hashCode = (str: string): string => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return hash.toString(36);
};

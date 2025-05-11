import { Hono } from "hono";
import { Env } from "../types.ts";

export const useErrorHandler = (app: Hono<Env>) => {
  app.onError((err, c) => {
    console.error(err);
    return c.json({ error: "Internal Server Error" }, 500);
  });
};

export * from "./constants.ts";
export * from "./exception.ts";
export * from "./logger.ts";
export * from "./rateLimiter.ts";

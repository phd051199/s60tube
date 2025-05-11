import type { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { Env } from "../types.ts";

export const useErrorHandler = (app: Hono<Env>) => {
  app.notFound(() => {
    throw new HTTPException(404, { message: "Not found" });
  });

  app.onError((err, c) => {
    if (err instanceof HTTPException) {
      return err.getResponse();
    }
    return c.newResponse(err.message, { status: 500 });
  });
};

import type { Hono } from "hono";
import { HTTPException } from "hono/http-exception";

export const useErrorHandler = (app: Hono) => {
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

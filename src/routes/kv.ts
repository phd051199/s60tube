import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { Env } from "../types.ts";
import { keySchema, ONE_WEEK_MS } from "../core/index.ts";

const router = new Hono<Env>();

router.get("/:key", zValidator("param", keySchema), async (c) => {
  const { key } = c.req.valid("param");
  const result = await c.get("kv").get([key]);

  if (!result.value) {
    return c.json({ error: "Key not found" }, 404);
  }

  return c.json(result);
});

router.post("/:key", zValidator("param", keySchema), async (c) => {
  const { key } = c.req.valid("param");
  const value = await c.req.json();

  const result = await c.get("kv").set([key], value, {
    expireIn: ONE_WEEK_MS,
  });

  return c.json(result);
});

router.delete("/:key", zValidator("param", keySchema), async (c) => {
  const { key } = c.req.valid("param");
  await c.get("kv").delete([key]);

  return c.json({
    message: `Key '${key}' deleted successfully`,
  });
});

export default router;

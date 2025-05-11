import z from "zod";
import { vIdSchema } from "../utils/index.ts";

export const EXCLUDED_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "cf-ray",
  "cf-connecting-ip",
]);

export const ONE_WEEK_MS = 1000 * 60 * 60 * 24 * 7;

export const keySchema = z.object({
  key: z.string().min(1),
});

export const videoIdSchema = z.object({
  id: vIdSchema,
});

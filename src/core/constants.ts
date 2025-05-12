import z from "zod";

import { vIdSchema } from "../utils/index.ts";

export const EXCLUDED_HEADERS = new Set([
  "host",
  "connection",
  "content-length",
  "cf-ray",
  "cf-connecting-ip",
]);

export const YTB_LINK_TTL = 1000 * 60 * 60 * 24 * 1; // 1 day

export const keySchema = z.object({
  key: z.string().min(1),
});

export const videoIdSchema = z.object({
  id: vIdSchema,
});

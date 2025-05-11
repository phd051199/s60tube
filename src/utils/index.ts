// deno-lint-ignore-file no-explicit-any
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import _ from "lodash";
import { z } from "zod";
import { Env } from "../types.ts";

export const message = {
  INVALID_VIDEO_ID: "Invalid video ID",
  INVALID_TOKEN: "Invalid token",
  VIDEO_NOT_FOUND: "Video not found",
  INVALID_CERTIFICATE: "Invalid certificate",
};

export const signToken = (
  sub: string,
  secret: string,
  exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24
) => sign({ sub, exp }, secret);

export const vIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{11}$/, {
  message: message.INVALID_VIDEO_ID,
});

export const filterData = (data: any) => {
  return _.reject(data.videos, (item: any) => {
    const id = _.get(item, "id");
    const durationSeconds = _.get(item, "duration.seconds");
    const type = _.get(item, "type");
    const title = _.get(item, "title.text");

    return (
      !id ||
      !durationSeconds ||
      type?.includes("Reel") ||
      title?.includes("#short")
    );
  });
};

export const getDownloadLink = async (videoId: string, c: Context<Env>) => {
  const innertube = c.get("innertube");
  const info = await innertube.getBasicInfo(videoId);

  const url = info
    .chooseFormat({
      type: "video+audio",
      quality: "360p",
    })
    ?.decipher(innertube.session.player);

  if (!url) {
    throw new HTTPException(404, { message: message.VIDEO_NOT_FOUND });
  }

  return url;
};

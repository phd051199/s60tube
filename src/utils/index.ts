import BG from "bgutils-js";
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import _ from "lodash";
import Innertube, { ProtoUtils, Utils } from "youtubei.js/cf-worker";
import { z } from "zod";

export const message = {
  INVALID_VIDEO_ID: "Invalid video ID",
  VIDEO_NOT_FOUND: "Video not found",
};

export const vIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{11}$/, {
  message: message.INVALID_VIDEO_ID,
});

export const filterData = (data: any) => {
  const filteredVideos = _.reject(data.videos, (item: any) => {
    const id = _.get(item, "id");
    const durationSeconds = _.get(item, "duration.seconds");

    return !id || !durationSeconds;
  });

  return filteredVideos.map((item: any) => ({
    id: _.get(item, "id"),
    thumbnail_overlays: _.get(item, "thumbnail_overlays"),
    title: {
      text: _.get(item, "title.text", ""),
    },
    short_view_count: {
      text: _.get(item, "short_view_count.text", ""),
    },
    published: {
      text: _.get(item, "published.text", ""),
    },
    author: {
      name: _.get(item, "author.name", ""),
    },
    duration: {
      text: _.get(item, "duration.text", ""),
      seconds: _.get(item, "duration.seconds", 0),
    },
  }));
};

export const getDownloadLink = async (
  innertube: Innertube,
  videoId: string,
) => {
  try {
    const info = await innertube.getBasicInfo(videoId).catch((error) => {
      console.error("Error getting basic info", videoId);
      throw error;
    });

    const format = info.chooseFormat({
      type: "video+audio",
      format: "mp4",
    });

    const url = format?.decipher(innertube.session.player);
    if (!url) {
      throw new HTTPException(404, { message: message.VIDEO_NOT_FOUND });
    }
    return { url, format };
  } catch (error) {
    console.error("Error getting download link", videoId, error);
    throw error;
  }
};

export function fetchFunction(
  input: string | Request | URL,
  init?: RequestInit,
): Promise<Response> {
  const url = typeof input === "string"
    ? new URL(input)
    : input instanceof URL
    ? input
    : new URL(input.url);

  if (!url.pathname.includes("v1")) {
    return fetch(input, init);
  }

  const headers = new Headers(
    init?.headers || (input instanceof Request ? input.headers : undefined),
  );

  const request = new Request(
    `https://dph.io.vn/?__host=${url.href}`,
    input instanceof Request ? input : undefined,
  );
  headers.delete("user-agent");

  return fetch(
    request,
    init
      ? {
        ...init,
        headers,
      }
      : {
        headers,
      },
  );
}

export const saveVideoUrl = async (videoId: string, videoUrl: string) => {
  await fetch(`https://dph.io.vn/kv`, {
    method: "POST",
    body: JSON.stringify({
      key: videoId,
      value: videoUrl,
    }),
  });
};

export const generatePoToken = () => {
  const visitorData = ProtoUtils.encodeVisitorData(
    Utils.generateRandomString(11),
    Math.floor(Date.now() / 1000),
  );
  const poToken = BG.PoToken.generateColdStartToken(visitorData);

  return { poToken, visitorData };
};

export const getVideoInfo = async (c: Context, id: string) => {
  const innertube = c.get("innertube");
  const { url, format } = await getDownloadLink(innertube, id);

  await saveVideoUrl(id, url);

  return { format };
};

export { createSessionCache, SessionCache } from "./cache.ts";

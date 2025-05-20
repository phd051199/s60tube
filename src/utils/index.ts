import BG from "bgutils-js";
import { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { proxy } from "hono/proxy";
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

const getURL = (input: string | Request | URL) => {
  return typeof input === "string"
    ? new URL(input)
    : input instanceof URL
    ? input
    : new URL(input.url);
};

const DEFAULT_PROXY_URLS = [
  "https://dph.io.vn/proxy",
  "https://stream.dph.io.vn/proxy",
];

export function fetchFunction(
  input: string | Request | URL,
  init?: RequestInit,
  proxyUrls: string[] = DEFAULT_PROXY_URLS,
): Promise<Response> {
  const headers = new Headers(
    init?.headers || (input instanceof Request ? input.headers : undefined),
  );
  const href = getURL(input).href;
  if (!href.includes("v1")) {
    return fetch(input, init);
  }

  const requestOptions = {
    headers,
    ...init,
    ...(input instanceof Request ? { raw: input } : {}),
  };

  return tryProxies(href, requestOptions, proxyUrls, 0);
}

async function tryProxies(
  href: string,
  requestOptions: any,
  proxyUrls: string[],
  index: number,
): Promise<Response> {
  if (index >= proxyUrls.length) {
    throw new Error(
      `All ${proxyUrls.length} proxies failed when fetching ${href}`,
    );
  }

  const currentProxy = proxyUrls[index];
  const proxyUrl = `${currentProxy}?__href=${href}`;

  try {
    const response = await proxy(proxyUrl, requestOptions);

    const clonedResponse = response.clone();
    const body = await clonedResponse.json().catch((_e) => {
      return {};
    });

    if (body.playabilityStatus?.status === "LOGIN_REQUIRED") {
      throw new Error("Login required");
    }

    return response;
  } catch {
    return tryProxies(href, requestOptions, proxyUrls, index + 1);
  }
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
  const result = await getDownloadLink(innertube, id);

  await saveVideoUrl(id, result.url);

  return result;
};

export { createSessionCache, SessionCache } from "./cache.ts";

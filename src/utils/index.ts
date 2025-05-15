import _ from "lodash";
import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { sign } from "hono/jwt";
import { z } from "zod";
import { ProtoUtils, Utils } from "youtubei.js/cf-worker";
import BG from "bgutils-js";

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
  exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24,
) => sign({ sub, exp }, secret);

export const vIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{11}$/, {
  message: message.INVALID_VIDEO_ID,
});

export const filterData = (data: any) => {
  return _.reject(data.videos, (item: any) => {
    const id = _.get(item, "id");
    const durationSeconds = _.get(item, "duration.seconds");

    return !id || !durationSeconds;
  });
};

export const getDownloadLink = async (videoId: string, c: Context<Env>) => {
  const innertube = c.get("innertube");
  const info = await innertube.getBasicInfo(videoId);

  const format = info.chooseFormat({
    type: "video+audio",
    quality: "360p",
  });

  const url = format?.decipher(innertube.session.player);
  if (!url) {
    throw new HTTPException(404, { message: message.VIDEO_NOT_FOUND });
  }

  return { url, format };
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

  const proxyUrl = `https://${
    Deno.env.get("YTB_PROXY_URL")
  }?__host=${url.href}`;
  const headers = new Headers(
    init?.headers || (input instanceof Request ? input.headers : undefined),
  );

  if (url.pathname.includes("v1/player")) {
    url.searchParams.set(
      "$fields",
      "playerConfig,captions,playabilityStatus,streamingData,responseContext.mainAppWebResponseContext.datasyncId,videoDetails.isLive,videoDetails.isLiveContent,videoDetails.title,videoDetails.author,playbackTracking",
    );
  }

  url.searchParams.set("__headers", JSON.stringify([...headers]));
  const request = new Request(
    proxyUrl,
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

export const saveVideoUrl = async (
  videoId: string,
  videoUrl: string,
) => {
  await fetch(`https://${Deno.env.get("YTB_PROXY_URL")}/kv`, {
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

  console.log("Generating PO token", poToken);
  console.log("Visitor data", visitorData);
  return { poToken, visitorData };
};

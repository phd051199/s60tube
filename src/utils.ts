import { sign } from 'hono/jwt';
import Innertube from 'youtubei.js/cf-worker';
import { z } from 'zod';
import { message } from './constants';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import reject from 'lodash/reject';
import get from 'lodash/get';

export const signToken = (
  sub: string,
  secret: string,
  exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24
) => sign({ sub, exp }, secret);

export const createInnertubeInstance = () =>
  Innertube.create({
    lang: 'vi',
    location: 'VN',
    timezone: 'Asia/Ho_Chi_Minh'
  });

export const vIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{11}$/, {
  message: message.INVALID_VIDEO_ID
});

export const filterData = (data: any) => {
  return reject(
    data.videos,
    (item) =>
      !get(item, 'id') ||
      !get(item, 'duration.seconds') ||
      get(item, 'type').includes('Reel') ||
      get(item, 'title.text', '').includes('#short')
  );
};

export const signVideoLink = async (videoId: string, c: Context<Env>) => {
  const yt = await createInnertubeInstance();

  const streaming = await yt.getStreamingData(videoId, {
    type: 'video+audio',
    quality: '360p'
  });

  const url = streaming.decipher(yt.session.player);

  if (!url) {
    throw new HTTPException(404, { message: message.VIDEO_NOT_FOUND });
  }

  await c.env.LINK.put(videoId, url, {
    expirationTtl: 60 * 60 * 6
  });

  return url;
};

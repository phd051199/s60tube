import { sign } from 'hono/jwt';
import { z } from 'zod';
import { invidiousDomains, message } from '../constants';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { reject, get } from 'lodash';
import Innertube, { ClientType, InnertubeConfig } from 'youtubei.js/cf-worker';

export const signToken = (
  sub: string,
  secret: string,
  exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24
) => sign({ sub, exp }, secret);

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

export const createInnertube = async (config: InnertubeConfig = {}) => {
  return Innertube.create({
    ...config,
    lang: 'vi',
    location: 'VN',
    timezone: 'Asia/Ho_Chi_Minh'
  });
};

export const getDownloadLink = async (videoId: string, c: Context<Env>) => {
  const innertube = await createInnertube();

  const info = await innertube.getBasicInfo(videoId, ClientType.ANDROID);
  const url = info
    .chooseFormat({
      type: 'video+audio',
      quality: '360p'
    })
    ?.decipher(innertube.session.player);

  if (!url) {
    throw new HTTPException(404, { message: message.VIDEO_NOT_FOUND });
  }

  await c.env.LINK.put(videoId, url, {
    expirationTtl: 60 * 60 * 6
  });
};

export const getDownloadLinkInvidious = async (
  videoId: string,
  c: Context<Env>
) => {
  let needFetch = true;
  let index = 0;

  while (needFetch && index < invidiousDomains.length) {
    const host = invidiousDomains[index];
    try {
      const { headers } = await fetch(
        `https://${host}/latest_version?id=${videoId}&itag=18`,
        {
          redirect: 'manual'
        }
      );
      const url = headers.get('location');
      if (!url) throw new Error('No location header found');

      await c.env.LINK.put(videoId, url, {
        expirationTtl: 60 * 60 * 6
      });
      needFetch = false;
    } catch (error) {
      index++;
    }
  }

  if (needFetch) {
    throw new HTTPException(500, {
      message: 'Failed to fetch download link from all domains'
    });
  }

  return invidiousDomains[index];
};

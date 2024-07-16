import { sign } from 'hono/jwt';
import { z } from 'zod';
import { message } from '../constants';
import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import _ from 'lodash';
import Innertube, { ClientType } from 'youtubei.js/cf-worker';

export const signToken = (
  sub: string,
  secret: string,
  exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24
) => sign({ sub, exp }, secret);

export const vIdSchema = z.string().regex(/^[a-zA-Z0-9_-]{11}$/, {
  message: message.INVALID_VIDEO_ID
});

export const filterData = (data: any) => {
  return _.reject(
    data.videos,
    (item) =>
      !_.get(item, 'id') ||
      !_.get(item, 'duration.seconds') ||
      _.get(item, 'type').includes('Reel') ||
      _.get(item, 'title.text', '').includes('#short')
  );
};

export const createInnertube = async (config = {}) => {
  return Innertube.create({
    ...config,
    lang: 'vi',
    location: 'VN',
    timezone: 'Asia/Ho_Chi_Minh'
  });
};

export const getDownloadLink = async (videoId: string, c: Context<Env>) => {
  const innertube = await createInnertube();

  const info = await innertube.getBasicInfo(videoId);
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

const getInvidiousApis = async (c: Context<Env>) => {
  const domains = await c.env.INVIDIOUS_API.get<{}[]>('domains', 'json');
  if (domains?.length) {
    return domains;
  }
  const response = await fetch(
    'https://api.invidious.io/instances.json?sort_by=type,health'
  );

  const json = await response.json<{}[]>();
  const data = _(json)
    .filter((item) => item[1].stats)
    .map((item) => item[0])
    .value();

  await c.env.INVIDIOUS_API.put('domains', JSON.stringify(data), {
    expirationTtl: 60 * 60 * 1
  });

  if (!data || !data.length) {
    return ['invidious.duyph.xyz'];
  }

  return data;
};

export const getDownloadLinkInvidious = async (
  videoId: string,
  c: Context<Env>
) => {
  const invidiousDomains = await getInvidiousApis(c);
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

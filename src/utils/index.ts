import type { Context } from 'hono';
import { HTTPException } from 'hono/http-exception';
import { sign } from 'hono/jwt';
import _ from 'lodash';
import { z } from 'zod';
import { message } from '../core/constants';

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

export const getDownloadLink = async (videoId: string, c: Context<Env>) => {
  const info = await c.get('innertube').getBasicInfo(videoId);
  const url = info
    .chooseFormat({
      type: 'video+audio',
      quality: '360p'
    })
    ?.decipher(c.get('innertube').session.player);

  if (!url) {
    throw new HTTPException(404, { message: message.VIDEO_NOT_FOUND });
  }

  return url;
};


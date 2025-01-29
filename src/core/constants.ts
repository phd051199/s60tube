export const message = {
  INVALID_VIDEO_ID: 'Invalid video ID',
  INVALID_TOKEN: 'Invalid token',
  VIDEO_NOT_FOUND: 'Video not found',
  INVALID_CERTIFICATE: 'Invalid certificate'
};

export const EXCLUDED_HEADERS = new Set([
  'host',
  'connection',
  'content-length',
  'cf-ray',
  'cf-connecting-ip'
]);

export const APP_PORT = Number(process.env.PORT || 3003);

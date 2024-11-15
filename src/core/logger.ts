import { Context } from 'hono';

export const customLogger = (c: Context) => {
  console.log(
    'Request received - method: %s, path: %s, query: %o, userAgent: %s, ip: %s',
    c.req.method,
    c.req.path,
    c.req.query(),
    c.req.header('user-agent'),
    c.req.header('x-forwarded-for')
  );
};

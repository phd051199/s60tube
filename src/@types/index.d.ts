import type { Innertube } from 'youtubei.js/cf-worker';

declare global {
  type Env = {
    Variables: {};
    Bindings: {
      JWT_SECRET: string;
      COREPLAYER_URL: string;
      LINK: KVNamespace<string>;
    };
  };
}

declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, props: { title: string }): Response;
  }
}

export {};

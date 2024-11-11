declare global {
  type Env = {
    Variables: {
      innertube: Innertube;
    };
    Bindings: {
      JWT_SECRET: string;
      COREPLAYER_URL: string;
      LINK: KVNamespace<string>;
      INVIDIOUS_API: KVNamespace<string>;
    };
  };
}

declare module 'hono' {
  interface ContextRenderer {
    (content: string | Promise<string>, props: { title: string }): Response;
  }
}

export {};

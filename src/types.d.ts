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

export {};

import { type Innertube } from "youtubei.js/cf-worker";

export type Env = {
  Variables: {
    innertube: Innertube;
    kv: Deno.Kv;
  };
  YTB_PROXY_URL: string;
};

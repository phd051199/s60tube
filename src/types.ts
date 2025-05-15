import { type Innertube } from "youtubei.js/cf-worker";

export type Env = {
  Variables: {
    innertube: Innertube;
  };
  YTB_PROXY_URL: string;
};

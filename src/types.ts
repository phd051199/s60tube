import Innertube from "youtubei.js";

export type Env = {
  Variables: {
    innertube: Innertube;
    kv: Deno.Kv;
  };
};

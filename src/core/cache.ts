export class CacheMap extends Map {
    maxSize: number;

    constructor(maxSize: number) {
        super();
        this.maxSize = maxSize;
    }
}

export const videoUrlCache = new CacheMap(10000);
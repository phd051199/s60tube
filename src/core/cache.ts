export class CacheMap<K, V> extends Map<K, V> {
  maxSize: number;

  constructor(maxSize: number) {
    super();
    this.maxSize = maxSize;
  }

  set(key: K, value: V): this {
    if (this.size >= this.maxSize) {
      const firstKey = this.keys().next().value;
      this.delete(firstKey);
    }
    return super.set(key, value);
  }
}

export const videoUrlCache = new CacheMap<string, string>(10000);

export class SessionCache<T> {
  private cache: Map<string, { data: T; expiry: number }> = new Map();

  constructor(private defaultTtl: number = 5 * 60 * 1000) {}

  set(key: string, data: T, ttl?: number): void {
    const expiry = Date.now() + (ttl || this.defaultTtl);
    this.cache.set(key, { data, expiry });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  has(key: string): boolean {
    return this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }
}

export const createSessionCache = <T>(ttl?: number) => new SessionCache<T>(ttl);

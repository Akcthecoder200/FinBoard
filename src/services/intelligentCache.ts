// Intelligent Caching System
// Handles response caching, TTL management, and request deduplication

export interface CacheEntry<T = unknown> {
  key: string;
  data: T;
  timestamp: Date;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: Date;
  size: number; // Estimated size in bytes
  tags: string[]; // For cache invalidation by tags
}

export interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  totalRequests: number;
  totalHits: number;
  totalMisses: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

export interface CacheConfig {
  maxSize: number; // Maximum cache size in bytes
  maxEntries: number; // Maximum number of entries
  defaultTtl: number; // Default TTL in milliseconds
  enableCompression: boolean;
  enableMetrics: boolean;
}

class IntelligentCacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private pendingRequests: Map<string, Promise<unknown>> = new Map();
  private stats: CacheStats = {
    totalEntries: 0,
    totalSize: 0,
    hitRate: 0,
    totalRequests: 0,
    totalHits: 0,
    totalMisses: 0,
    oldestEntry: null,
    newestEntry: null,
  };

  private config: CacheConfig = {
    maxSize: 50 * 1024 * 1024, // 50MB
    maxEntries: 1000,
    defaultTtl: 5 * 60 * 1000, // 5 minutes
    enableCompression: true,
    enableMetrics: true,
  };

  constructor(config?: Partial<CacheConfig>) {
    if (config) {
      this.config = { ...this.config, ...config };
    }

    // Start cleanup interval
    this.startCleanupInterval();
  }

  // Get data from cache or execute fetcher function
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      ttl?: number;
      tags?: string[];
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    const cacheKey = this.normalizeKey(key);

    this.stats.totalRequests++;

    // Check for force refresh
    if (options?.forceRefresh) {
      console.log(`🔄 Force refresh requested for ${cacheKey}`);
      return this.fetchAndCache(cacheKey, fetcher, options);
    }

    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached && !this.isExpired(cached)) {
      this.stats.totalHits++;
      cached.accessCount++;
      cached.lastAccessed = new Date();
      this.updateStats();

      console.log(
        `✅ Cache hit for ${cacheKey} (accessed ${cached.accessCount} times)`
      );
      return cached.data as T;
    }

    // Cache miss or expired
    this.stats.totalMisses++;

    // Check for pending request (deduplication)
    const pendingRequest = this.pendingRequests.get(cacheKey);
    if (pendingRequest) {
      console.log(`⏳ Deduplicating request for ${cacheKey}`);
      return pendingRequest as Promise<T>;
    }

    // Fetch and cache new data
    return this.fetchAndCache(cacheKey, fetcher, options);
  }

  // Fetch data and store in cache
  private async fetchAndCache<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      ttl?: number;
      tags?: string[];
    }
  ): Promise<T> {
    const fetchPromise = fetcher();
    this.pendingRequests.set(key, fetchPromise);

    try {
      const data = await fetchPromise;
      const ttl = options?.ttl || this.config.defaultTtl;
      const tags = options?.tags || [];

      this.set(key, data, ttl, tags);
      console.log(`💾 Cached new data for ${key} (TTL: ${ttl}ms)`);

      return data;
    } finally {
      this.pendingRequests.delete(key);
    }
  }

  // Set data in cache
  set<T>(key: string, data: T, ttl?: number, tags: string[] = []): void {
    const cacheKey = this.normalizeKey(key);
    const entryTtl = ttl || this.config.defaultTtl;
    const size = this.estimateSize(data);

    // Check if we need to make space
    this.makeSpace(size);

    const entry: CacheEntry<T> = {
      key: cacheKey,
      data,
      timestamp: new Date(),
      ttl: entryTtl,
      accessCount: 1,
      lastAccessed: new Date(),
      size,
      tags,
    };

    this.cache.set(cacheKey, entry);
    this.updateStats();
  }

  // Get data from cache without fetching
  getOnly<T>(key: string): T | null {
    const cacheKey = this.normalizeKey(key);
    const cached = this.cache.get(cacheKey);

    if (cached && !this.isExpired(cached)) {
      cached.accessCount++;
      cached.lastAccessed = new Date();
      return cached.data as T;
    }

    return null;
  }

  // Check if key exists and is not expired
  has(key: string): boolean {
    const cacheKey = this.normalizeKey(key);
    const cached = this.cache.get(cacheKey);
    return cached !== undefined && !this.isExpired(cached);
  }

  // Delete specific cache entry
  delete(key: string): boolean {
    const cacheKey = this.normalizeKey(key);
    const deleted = this.cache.delete(cacheKey);
    if (deleted) {
      this.updateStats();
    }
    return deleted;
  }

  // Clear cache by tags
  invalidateByTags(tags: string[]): number {
    let deletedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (entry.tags.some((tag) => tags.includes(tag))) {
        this.cache.delete(key);
        deletedCount++;
      }
    }

    if (deletedCount > 0) {
      this.updateStats();
      console.log(
        `🗑️ Invalidated ${deletedCount} cache entries by tags: ${tags.join(
          ", "
        )}`
      );
    }

    return deletedCount;
  }

  // Clear all cache
  clear(): void {
    this.cache.clear();
    this.pendingRequests.clear();
    this.updateStats();
    console.log("🗑️ Cache cleared");
  }

  // Get cache statistics
  getStats(): CacheStats {
    return { ...this.stats };
  }

  // Get cache configuration
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  // Update cache configuration
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    console.log("⚙️ Cache configuration updated", this.config);
  }

  // Get all cache keys
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  // Get cache entries for debugging
  getEntries(): CacheEntry[] {
    return Array.from(this.cache.values());
  }

  // Normalize cache key
  private normalizeKey(key: string): string {
    return key.toLowerCase().trim();
  }

  // Check if cache entry is expired
  private isExpired(entry: CacheEntry): boolean {
    const now = Date.now();
    const entryTime = entry.timestamp.getTime();
    return now - entryTime > entry.ttl;
  }

  // Estimate size of data in bytes
  private estimateSize(data: unknown): number {
    try {
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch {
      // Fallback estimation
      if (typeof data === "string") return data.length * 2;
      if (typeof data === "number") return 8;
      if (typeof data === "boolean") return 4;
      if (typeof data === "object") return 1024; // Rough estimate
      return 100; // Default estimate
    }
  }

  // Make space in cache if needed
  private makeSpace(requiredSize: number): void {
    // Check if we need to make space
    if (
      this.stats.totalEntries >= this.config.maxEntries ||
      this.stats.totalSize + requiredSize > this.config.maxSize
    ) {
      console.log(
        `🧹 Making space in cache (entries: ${this.stats.totalEntries}/${this.config.maxEntries}, size: ${this.stats.totalSize}/${this.config.maxSize})`
      );

      this.evictLeastRecentlyUsed();
    }
  }

  // Evict least recently used entries
  private evictLeastRecentlyUsed(): void {
    const entries = Array.from(this.cache.entries());

    // Sort by last accessed time (oldest first)
    entries.sort(
      ([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime()
    );

    // Remove oldest 25% of entries
    const entriesToRemove = Math.ceil(entries.length * 0.25);

    for (let i = 0; i < entriesToRemove; i++) {
      const [key] = entries[i];
      this.cache.delete(key);
    }

    console.log(`🗑️ Evicted ${entriesToRemove} LRU cache entries`);
  }

  // Update cache statistics
  private updateStats(): void {
    this.stats.totalEntries = this.cache.size;
    this.stats.totalSize = Array.from(this.cache.values()).reduce(
      (total, entry) => total + entry.size,
      0
    );

    this.stats.hitRate =
      this.stats.totalRequests > 0
        ? (this.stats.totalHits / this.stats.totalRequests) * 100
        : 0;

    const entries = Array.from(this.cache.values());
    if (entries.length > 0) {
      const timestamps = entries.map((e) => e.timestamp);
      this.stats.oldestEntry = new Date(
        Math.min(...timestamps.map((t) => t.getTime()))
      );
      this.stats.newestEntry = new Date(
        Math.max(...timestamps.map((t) => t.getTime()))
      );
    } else {
      this.stats.oldestEntry = null;
      this.stats.newestEntry = null;
    }
  }

  // Start automatic cleanup of expired entries
  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpired();
    }, 60000); // Clean every minute
  }

  // Remove expired entries
  private cleanupExpired(): void {
    let cleanedCount = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      this.updateStats();
      console.log(`🧹 Cleaned up ${cleanedCount} expired cache entries`);
    }
  }

  // Warm up cache with predefined data
  async warmUp(
    warmupData: Array<{
      key: string;
      fetcher: () => Promise<unknown>;
      ttl?: number;
      tags?: string[];
    }>
  ): Promise<void> {
    console.log(`🔥 Warming up cache with ${warmupData.length} entries`);

    const promises = warmupData.map(async ({ key, fetcher, ttl, tags }) => {
      try {
        await this.get(key, fetcher, { ttl, tags });
      } catch (error) {
        console.warn(`Failed to warm up cache for ${key}:`, error);
      }
    });

    await Promise.all(promises);
    console.log("🔥 Cache warmup completed");
  }
}

// Create singleton instance
export const intelligentCache = new IntelligentCacheService({
  maxSize: 100 * 1024 * 1024, // 100MB for financial data
  maxEntries: 2000,
  defaultTtl: 5 * 60 * 1000, // 5 minutes for stock data
  enableCompression: true,
  enableMetrics: true,
});

// Stock-specific cache with shorter TTL
export const stockCache = new IntelligentCacheService({
  maxSize: 50 * 1024 * 1024, // 50MB
  maxEntries: 1000,
  defaultTtl: 2 * 60 * 1000, // 2 minutes for real-time data
  enableCompression: true,
  enableMetrics: true,
});

// Market data cache with longer TTL
export const marketCache = new IntelligentCacheService({
  maxSize: 25 * 1024 * 1024, // 25MB
  maxEntries: 500,
  defaultTtl: 10 * 60 * 1000, // 10 minutes for market overview
  enableCompression: true,
  enableMetrics: true,
});

// Cache utility functions
export const cacheUtils = {
  // Generate cache key for stock data
  stockKey: (symbol: string, source?: string) =>
    `stock:${symbol.toUpperCase()}${source ? `:${source}` : ""}`,

  // Generate cache key for market data
  marketKey: (type: string, region?: string) =>
    `market:${type}${region ? `:${region}` : ""}`,

  // Generate cache key for crypto data
  cryptoKey: (symbol: string, currency = "USD") =>
    `crypto:${symbol.toUpperCase()}:${currency.toUpperCase()}`,

  // Get cache tags for financial data
  getTags: (type: "stock" | "crypto" | "market", symbol?: string) => {
    const tags: string[] = [type];
    if (symbol) tags.push(`symbol:${symbol.toUpperCase()}`);
    return tags;
  },
};

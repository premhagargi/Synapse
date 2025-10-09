/**
 * @fileoverview Caching utilities for improved performance
 */

import { CACHE_CONFIG } from '@/config/constants';

// Simple in-memory cache implementation
class MemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>();

  set<T>(key: string, value: T, ttl: number = CACHE_CONFIG.documentTtl): void {
    const expiry = Date.now() + (ttl * 1000);
    this.cache.set(key, { value, expiry });
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key);

    if (!item) {
      return null;
    }

    if (Date.now() > item.expiry) {
      this.cache.delete(key);
      return null;
    }

    return item.value as T;
  }

  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }

  // Clean up expired entries
  cleanup(): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

// Singleton cache instance
export const memoryCache = new MemoryCache();

// Cache key generators
export const cacheKeys = {
  document: (id: string) => `document:${id}`,
  documentList: (userId: string, filters?: string) => `documents:${userId}:${filters || 'all'}`,
  analysis: (documentId: string) => `analysis:${documentId}`,
  user: (id: string) => `user:${id}`,
  analytics: (userId: string, period: string) => `analytics:${userId}:${period}`,
} as const;

// Cache wrapper functions
export function cacheGet<T>(key: string): T | null {
  return memoryCache.get<T>(key);
}

export function cacheSet<T>(key: string, value: T, ttl?: number): void {
  memoryCache.set(key, value, ttl);
}

export function cacheDelete(key: string): boolean {
  return memoryCache.delete(key);
}

export function cacheClear(): void {
  memoryCache.clear();
}

// Cached function decorator
export function withCache<T extends (...args: any[]) => any>(
  fn: T,
  keyGenerator: (...args: Parameters<T>) => string,
  ttl?: number
): T {
  return ((...args: Parameters<T>) => {
    const key = keyGenerator(...args);
    const cached = cacheGet<ReturnType<T>>(key);

    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);
    if (result instanceof Promise) {
      return result.then(value => {
        cacheSet(key, value, ttl);
        return value;
      });
    } else {
      cacheSet(key, result, ttl);
      return result;
    }
  }) as T;
}

// Firebase-specific caching utilities
export class FirebaseCache {
  private static instance: FirebaseCache;
  private cache = memoryCache;

  static getInstance(): FirebaseCache {
    if (!FirebaseCache.instance) {
      FirebaseCache.instance = new FirebaseCache();
    }
    return FirebaseCache.instance;
  }

  // Cache document data
  cacheDocument<T>(id: string, data: T): void {
    this.cache.set(cacheKeys.document(id), data, CACHE_CONFIG.documentTtl);
  }

  getCachedDocument<T>(id: string): T | null {
    return this.cache.get<T>(cacheKeys.document(id));
  }

  // Cache document lists
  cacheDocumentList<T>(userId: string, filters: string, data: T[]): void {
    this.cache.set(cacheKeys.documentList(userId, filters), data, CACHE_CONFIG.documentTtl);
  }

  getCachedDocumentList<T>(userId: string, filters?: string): T[] | null {
    return this.cache.get<T[]>(cacheKeys.documentList(userId, filters));
  }

  // Cache analysis results
  cacheAnalysis<T>(documentId: string, data: T): void {
    this.cache.set(cacheKeys.analysis(documentId), data, CACHE_CONFIG.analysisTtl);
  }

  getCachedAnalysis<T>(documentId: string): T | null {
    return this.cache.get<T>(cacheKeys.analysis(documentId));
  }

  // Cache user data
  cacheUser<T>(id: string, data: T): void {
    this.cache.set(cacheKeys.user(id), data, CACHE_CONFIG.userTtl);
  }

  getCachedUser<T>(id: string): T | null {
    return this.cache.get<T>(cacheKeys.user(id));
  }

  // Invalidate cache for a document
  invalidateDocument(id: string): void {
    this.cache.delete(cacheKeys.document(id));
    this.cache.delete(cacheKeys.analysis(id));
  }

  // Invalidate all cache for a user
  invalidateUser(userId: string): void {
    this.cache.delete(cacheKeys.user(userId));

    // Clear all document lists for this user
    // Note: In a production system, you might want to use a more sophisticated
    // cache key pattern to make this more efficient
    for (const key of this.cache['cache'].keys()) {
      if (key.startsWith(`documents:${userId}:`)) {
        this.cache.delete(key);
      }
    }
  }

  // Clear all cache
  clearAll(): void {
    this.cache.clear();
  }
}

// Export singleton instance
export const firebaseCache = FirebaseCache.getInstance();

// Periodic cleanup of expired cache entries
if (typeof window !== 'undefined') {
  // Run cleanup every 5 minutes in browser
  setInterval(() => {
    memoryCache.cleanup();
  }, 5 * 60 * 1000);
} else {
  // Run cleanup every 5 minutes in Node.js
  setInterval(() => {
    memoryCache.cleanup();
  }, 5 * 60 * 1000);
}
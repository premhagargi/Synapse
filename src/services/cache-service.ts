/**
 * @fileoverview Advanced caching service for Firebase optimization
 */

import { firebaseCache, cacheKeys } from '@/shared/lib/cache';
import { logger } from '@/shared/lib/logger';
import type { Document, DocumentAnalysis, User } from '@/shared/types';

export class CacheService {
  private static instance: CacheService;

  static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  // Document caching methods
  async getCachedDocument<T>(id: string): Promise<T | null> {
    try {
      return firebaseCache.getCachedDocument<T>(id);
    } catch (error) {
      await logger.warn('Failed to retrieve cached document', {
        error: error instanceof Error ? error.message : 'Unknown error',
        documentId: id,
      });
      return null;
    }
  }

  async cacheDocument<T>(id: string, data: T, ttl?: number): Promise<void> {
    try {
      firebaseCache.cacheDocument(id, data);
      await logger.debug('Document cached successfully', {
        documentId: id,
        ttl,
      });
    } catch (error) {
      await logger.warn('Failed to cache document', {
        error: error instanceof Error ? error.message : 'Unknown error',
        documentId: id,
      });
    }
  }

  // Document list caching methods
  async getCachedDocumentList<T>(userId: string, filters?: string): Promise<T[] | null> {
    try {
      return firebaseCache.getCachedDocumentList<T>(userId, filters);
    } catch (error) {
      await logger.warn('Failed to retrieve cached document list', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        filters,
      });
      return null;
    }
  }

  async cacheDocumentList<T>(userId: string, filters: string, data: T[], ttl?: number): Promise<void> {
    try {
      firebaseCache.cacheDocumentList(userId, filters, data);
      await logger.debug('Document list cached successfully', {
        userId,
        filters,
        count: data.length,
      });
    } catch (error) {
      await logger.warn('Failed to cache document list', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
        filters,
      });
    }
  }

  // Analysis caching methods
  async getCachedAnalysis<T>(documentId: string): Promise<T | null> {
    try {
      return firebaseCache.getCachedAnalysis<T>(documentId);
    } catch (error) {
      await logger.warn('Failed to retrieve cached analysis', {
        error: error instanceof Error ? error.message : 'Unknown error',
        documentId,
      });
      return null;
    }
  }

  async cacheAnalysis<T>(documentId: string, data: T, ttl?: number): Promise<void> {
    try {
      firebaseCache.cacheAnalysis(documentId, data);
      await logger.debug('Analysis cached successfully', {
        documentId,
        ttl,
      });
    } catch (error) {
      await logger.warn('Failed to cache analysis', {
        error: error instanceof Error ? error.message : 'Unknown error',
        documentId,
      });
    }
  }

  // User caching methods
  async getCachedUser<T>(id: string): Promise<T | null> {
    try {
      return firebaseCache.getCachedUser<T>(id);
    } catch (error) {
      await logger.warn('Failed to retrieve cached user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: id,
      });
      return null;
    }
  }

  async cacheUser<T>(id: string, data: T, ttl?: number): Promise<void> {
    try {
      firebaseCache.cacheUser(id, data);
      await logger.debug('User cached successfully', {
        userId: id,
        ttl,
      });
    } catch (error) {
      await logger.warn('Failed to cache user', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId: id,
      });
    }
  }

  // Cache invalidation methods
  async invalidateDocument(id: string): Promise<void> {
    try {
      firebaseCache.invalidateDocument(id);
      await logger.debug('Document cache invalidated', {
        documentId: id,
      });
    } catch (error) {
      await logger.warn('Failed to invalidate document cache', {
        error: error instanceof Error ? error.message : 'Unknown error',
        documentId: id,
      });
    }
  }

  async invalidateUser(userId: string): Promise<void> {
    try {
      firebaseCache.invalidateUser(userId);
      await logger.debug('User cache invalidated', {
        userId,
      });
    } catch (error) {
      await logger.warn('Failed to invalidate user cache', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
    }
  }

  // Batch operations
  async invalidateMultipleDocuments(documentIds: string[]): Promise<void> {
    try {
      for (const id of documentIds) {
        await this.invalidateDocument(id);
      }

      await logger.debug('Multiple document caches invalidated', {
        count: documentIds.length,
        documentIds,
      });
    } catch (error) {
      await logger.warn('Failed to invalidate multiple document caches', {
        error: error instanceof Error ? error.message : 'Unknown error',
        count: documentIds.length,
      });
    }
  }

  // Cache statistics and monitoring
  async getCacheStats(): Promise<{
    totalEntries: number;
    hitRate: number;
    memoryUsage: number;
  }> {
    try {
      // In a real implementation, you would track cache hits/misses
      return {
        totalEntries: 0, // Would be implemented with actual cache metrics
        hitRate: 0,
        memoryUsage: 0,
      };
    } catch (error) {
      await logger.error('Failed to get cache statistics', error as Error);
      return {
        totalEntries: 0,
        hitRate: 0,
        memoryUsage: 0,
      };
    }
  }

  // Cache warming for frequently accessed data
  async warmCache(userId: string, documentIds?: string[]): Promise<void> {
    try {
      // In a real implementation, you would pre-load frequently accessed data
      await logger.debug('Cache warming initiated', {
        userId,
        documentIds,
      });
    } catch (error) {
      await logger.warn('Cache warming failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        userId,
      });
    }
  }

  // Clear all cache (for admin use)
  async clearAllCache(): Promise<void> {
    try {
      firebaseCache.clearAll();
      await logger.info('All cache cleared by admin');
    } catch (error) {
      await logger.error('Failed to clear all cache', error as Error);
    }
  }
}

// Export singleton instance
export const cacheService = CacheService.getInstance();

// Utility functions for common caching patterns
export async function withDocumentCache<T>(
  documentId: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = await cacheService.getCachedDocument<T>(documentId);

  if (cached) {
    await logger.debug('Document served from cache', { documentId });
    return cached;
  }

  const data = await fetcher();
  await cacheService.cacheDocument(documentId, data, ttl);

  return data;
}

export async function withAnalysisCache<T>(
  documentId: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = await cacheService.getCachedAnalysis<T>(documentId);

  if (cached) {
    await logger.debug('Analysis served from cache', { documentId });
    return cached;
  }

  const data = await fetcher();
  await cacheService.cacheAnalysis(documentId, data, ttl);

  return data;
}

export async function withUserCache<T>(
  userId: string,
  fetcher: () => Promise<T>,
  ttl?: number
): Promise<T> {
  const cached = await cacheService.getCachedUser<T>(userId);

  if (cached) {
    await logger.debug('User served from cache', { userId });
    return cached;
  }

  const data = await fetcher();
  await cacheService.cacheUser(userId, data, ttl);

  return data;
}
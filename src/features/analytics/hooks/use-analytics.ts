'use client';

/**
 * @fileoverview Analytics hook for fetching and managing analytics data
 */

import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/firebase';
import { logger } from '@/shared/lib/logger';
import { AnalyticsPeriod, AnalyticsData, RiskDistribution, UserActivity } from '@/shared/types';

interface UseAnalyticsOptions {
  period?: AnalyticsPeriod;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

interface UseAnalyticsReturn {
  data: AnalyticsData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  period: AnalyticsPeriod;
  setPeriod: (period: AnalyticsPeriod) => void;
}

export function useAnalytics(options: UseAnalyticsOptions = {}): UseAnalyticsReturn {
  const {
    period = AnalyticsPeriod.LAST_30_DAYS,
    autoRefresh = true,
    refreshInterval = 5 * 60 * 1000, // 5 minutes
  } = options;

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPeriod, setCurrentPeriod] = useState<AnalyticsPeriod>(period);

  const { user } = useUser();

  const fetchAnalytics = useCallback(async (selectedPeriod: AnalyticsPeriod) => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would call your analytics API
      // For now, we'll simulate the data

      const mockData: AnalyticsData = {
        totalDocuments: Math.floor(Math.random() * 1000) + 100,
        totalUsers: Math.floor(Math.random() * 50) + 10,
        complianceIssues: Math.floor(Math.random() * 200) + 50,
        averageProcessingTime: Math.floor(Math.random() * 10) + 5,
        riskDistribution: [
          {
            classification: 'compliance_issue' as any,
            severity: 'critical' as any,
            count: Math.floor(Math.random() * 20) + 5,
          },
          {
            classification: 'compliance_issue' as any,
            severity: 'high' as any,
            count: Math.floor(Math.random() * 30) + 10,
          },
          {
            classification: 'internal_process_issue' as any,
            severity: 'medium' as any,
            count: Math.floor(Math.random() * 50) + 20,
          },
          {
            classification: 'internal_process_issue' as any,
            severity: 'low' as any,
            count: Math.floor(Math.random() * 100) + 50,
          },
        ],
        userActivity: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          uploads: Math.floor(Math.random() * 20) + 5,
          analyses: Math.floor(Math.random() * 25) + 10,
          logins: Math.floor(Math.random() * 15) + 3,
        })),
        period: selectedPeriod,
      };

      setData(mockData);

      await logger.info('Analytics data fetched', {
        userId: user.uid,
        period: selectedPeriod,
        totalDocuments: mockData.totalDocuments,
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch analytics';
      setError(errorMessage);

      await logger.error('Analytics fetch failed', err as Error, {
        userId: user.uid,
        period: selectedPeriod,
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  const refresh = useCallback(async () => {
    await fetchAnalytics(currentPeriod);
  }, [fetchAnalytics, currentPeriod]);

  const setPeriod = useCallback((newPeriod: AnalyticsPeriod) => {
    setCurrentPeriod(newPeriod);
    fetchAnalytics(newPeriod);
  }, [fetchAnalytics]);

  // Initial fetch
  useEffect(() => {
    fetchAnalytics(currentPeriod);
  }, [fetchAnalytics, currentPeriod]);

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || !user) return;

    const interval = setInterval(() => {
      fetchAnalytics(currentPeriod);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchAnalytics, currentPeriod, user]);

  return {
    data,
    loading,
    error,
    refresh,
    period: currentPeriod,
    setPeriod,
  };
}

// Hook for real-time metrics
export function useRealtimeMetrics() {
  const [metrics, setMetrics] = useState({
    activeUsers: 0,
    processingDocuments: 0,
    systemLoad: 0,
    errorRate: 0,
  });

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setMetrics({
        activeUsers: Math.floor(Math.random() * 20) + 5,
        processingDocuments: Math.floor(Math.random() * 10) + 1,
        systemLoad: Math.floor(Math.random() * 30) + 10,
        errorRate: Math.floor(Math.random() * 5),
      });
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Hook for document processing metrics
export function useDocumentMetrics() {
  const [metrics, setMetrics] = useState({
    totalProcessed: 0,
    averageProcessingTime: 0,
    successRate: 0,
    queueSize: 0,
  });

  useEffect(() => {
    // Simulate document processing metrics
    const interval = setInterval(() => {
      setMetrics({
        totalProcessed: Math.floor(Math.random() * 10000) + 5000,
        averageProcessingTime: Math.floor(Math.random() * 15) + 5,
        successRate: Math.floor(Math.random() * 10) + 90,
        queueSize: Math.floor(Math.random() * 50),
      });
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}

// Hook for compliance metrics
export function useComplianceMetrics() {
  const [metrics, setMetrics] = useState({
    overallScore: 0,
    criticalIssues: 0,
    resolvedIssues: 0,
    pendingReviews: 0,
  });

  useEffect(() => {
    // Simulate compliance metrics
    const interval = setInterval(() => {
      setMetrics({
        overallScore: Math.floor(Math.random() * 20) + 75,
        criticalIssues: Math.floor(Math.random() * 10) + 2,
        resolvedIssues: Math.floor(Math.random() * 100) + 200,
        pendingReviews: Math.floor(Math.random() * 20) + 5,
      });
    }, 15000);

    return () => clearInterval(interval);
  }, []);

  return metrics;
}
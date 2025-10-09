'use client';

/**
 * @fileoverview Analytics metrics card component for dashboard
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MetricsCardProps {
  title: string;
  value: string | number;
  description?: string;
  trend?: {
    value: number;
    label: string;
    direction: 'up' | 'down' | 'neutral';
  };
  icon?: LucideIcon;
  className?: string;
  loading?: boolean;
}

export function MetricsCard({
  title,
  value,
  description,
  trend,
  icon: Icon,
  className,
  loading = false,
}: MetricsCardProps) {
  const getTrendIcon = () => {
    switch (trend?.direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />;
      case 'down':
        return <TrendingDown className="h-4 w-4" />;
      default:
        return <Minus className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (trend?.direction) {
      case 'up':
        return 'text-green-600 bg-green-100';
      case 'down':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  if (loading) {
    return (
      <Card className={cn('', className)}>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-24"></div>
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
        </CardHeader>
        <CardContent>
          <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-3 bg-gray-200 rounded animate-pulse w-20"></div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold mb-1">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
        )}
        {trend && (
          <div className="flex items-center gap-1">
            <Badge
              variant="secondary"
              className={cn('text-xs', getTrendColor())}
            >
              <span className="flex items-center gap-1">
                {getTrendIcon()}
                {trend.value > 0 ? '+' : ''}{trend.value}% {trend.label}
              </span>
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Specialized metrics cards for common use cases
export function DocumentCountCard({
  total,
  trend,
  loading
}: {
  total: number;
  trend?: { value: number; label: string };
  loading?: boolean;
}) {
  return (
    <MetricsCard
      title="Total Documents"
      value={total.toLocaleString()}
      description="documents uploaded and processed"
      trend={trend}
      icon={undefined}
      loading={loading}
    />
  );
}

export function ComplianceScoreCard({
  score,
  trend,
  loading
}: {
  score: number;
  trend?: { value: number; label: string };
  loading?: boolean;
}) {
  return (
    <MetricsCard
      title="Compliance Score"
      value={`${score}%`}
      description="overall compliance rating"
      trend={trend}
      icon={undefined}
      loading={loading}
    />
  );
}

export function ProcessingTimeCard({
  averageTime,
  trend,
  loading
}: {
  averageTime: number;
  trend?: { value: number; label: string };
  loading?: boolean;
}) {
  return (
    <MetricsCard
      title="Avg Processing Time"
      value={`${averageTime}s`}
      description="average document analysis time"
      trend={trend}
      icon={undefined}
      loading={loading}
    />
  );
}

export function RiskDistributionCard({
  critical,
  high,
  medium,
  low,
  loading
}: {
  critical: number;
  high: number;
  medium: number;
  low: number;
  loading?: boolean;
}) {
  const total = critical + high + medium + low;

  return (
    <Card className={loading ? 'animate-pulse' : ''}>
      <CardHeader>
        <CardTitle className="text-sm font-medium">Risk Distribution</CardTitle>
        <CardDescription>Compliance issues by severity</CardDescription>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500"></div>
            <span className="text-sm">Critical</span>
          </div>
          <span className="text-sm font-medium">{critical}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-orange-500"></div>
            <span className="text-sm">High</span>
          </div>
          <span className="text-sm font-medium">{high}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <span className="text-sm">Medium</span>
          </div>
          <span className="text-sm font-medium">{medium}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <span className="text-sm">Low</span>
          </div>
          <span className="text-sm font-medium">{low}</span>
        </div>
        <div className="pt-2 border-t">
          <div className="text-sm text-muted-foreground">
            Total: {total} issues
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
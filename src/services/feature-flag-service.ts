/**
 * @fileoverview Feature flag service for managing experimental features and A/B testing
 */

import { logger } from '@/shared/lib/logger';
import { UserRole } from '@/shared/types';

export interface FeatureFlag {
  name: string;
  enabled: boolean;
  description: string;
  userRoles?: UserRole[];
  percentage?: number; // For percentage-based rollouts
  conditions?: Record<string, any>;
  expiresAt?: Date;
}

export interface FeatureFlagContext {
  userId?: string;
  userRole?: UserRole;
  userAgent?: string;
  ipAddress?: string;
  environment?: string;
  customAttributes?: Record<string, any>;
}

export class FeatureFlagService {
  private static instance: FeatureFlagService;
  private flags = new Map<string, FeatureFlag>();
  private flagOverrides = new Map<string, boolean>();

  constructor() {
    this.initializeDefaultFlags();
  }

  static getInstance(): FeatureFlagService {
    if (!FeatureFlagService.instance) {
      FeatureFlagService.instance = new FeatureFlagService();
    }
    return FeatureFlagService.instance;
  }

  /**
   * Initialize default feature flags
   */
  private initializeDefaultFlags(): void {
    const defaultFlags: FeatureFlag[] = [
      {
        name: 'experimental_genkit_flows',
        enabled: process.env.FEATURE_EXPERIMENTAL_GENKIT === 'true',
        description: 'Enable experimental Genkit AI flows for advanced document analysis',
        userRoles: [UserRole.ADMIN, UserRole.ANALYST],
        percentage: 50, // 50% rollout
      },
      {
        name: 'enterprise_mode',
        enabled: process.env.FEATURE_ENTERPRISE_MODE === 'true',
        description: 'Enable enterprise demo mode with sample data',
        userRoles: [UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER],
      },
      {
        name: 'advanced_analytics',
        enabled: process.env.FEATURE_ADVANCED_ANALYTICS === 'true',
        description: 'Enable advanced analytics dashboard with charts and trends',
        userRoles: [UserRole.ADMIN, UserRole.ANALYST],
      },
      {
        name: 'export_features',
        enabled: process.env.FEATURE_EXPORT_FEATURES !== 'false',
        description: 'Enable document export functionality (PDF, CSV, JSON)',
        userRoles: [UserRole.ADMIN, UserRole.ANALYST],
      },
      {
        name: 'chat_interface',
        enabled: process.env.FEATURE_CHAT_INTERFACE !== 'false',
        description: 'Enable natural language Q&A interface for documents',
        userRoles: [UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER],
      },
      {
        name: 'real_time_collaboration',
        enabled: false,
        description: 'Enable real-time document collaboration features',
        userRoles: [UserRole.ADMIN, UserRole.ANALYST],
        percentage: 25, // 25% rollout for testing
      },
      {
        name: 'ai_powered_insights',
        enabled: true,
        description: 'Enable AI-powered insights and recommendations',
        userRoles: [UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER],
      },
      {
        name: 'bulk_operations',
        enabled: false,
        description: 'Enable bulk document operations (delete, export, analyze)',
        userRoles: [UserRole.ADMIN],
        percentage: 30, // Limited rollout
      },
    ];

    defaultFlags.forEach(flag => {
      this.flags.set(flag.name, flag);
    });
  }

  /**
   * Check if a feature is enabled for a given context
   */
  isFeatureEnabled(featureName: string, context?: FeatureFlagContext): boolean {
    try {
      // Check for override first
      const override = this.flagOverrides.get(featureName);
      if (override !== undefined) {
        return override;
      }

      const flag = this.flags.get(featureName);
      if (!flag) {
        return false;
      }

      // Check if flag is globally enabled
      if (!flag.enabled) {
        return false;
      }

      // Check expiration
      if (flag.expiresAt && new Date() > flag.expiresAt) {
        return false;
      }

      // Check user role restrictions
      if (flag.userRoles && context?.userRole) {
        if (!flag.userRoles.includes(context.userRole)) {
          return false;
        }
      }

      // Check percentage-based rollout
      if (flag.percentage && context?.userId) {
        const userHash = this.hashString(context.userId);
        const userPercentage = userHash % 100;

        if (userPercentage >= flag.percentage) {
          return false;
        }
      }

      // Check custom conditions
      if (flag.conditions) {
        if (!this.evaluateConditions(flag.conditions, context)) {
          return false;
        }
      }

      return true;
    } catch (error) {
      logger.error('Feature flag evaluation failed', error as Error, {
        featureName,
        context,
      });

      // Default to disabled on error
      return false;
    }
  }

  /**
   * Enable a feature flag
   */
  async enableFeature(featureName: string, context?: FeatureFlagContext): Promise<void> {
    try {
      this.flagOverrides.set(featureName, true);

      await logger.info('Feature flag enabled', {
        featureName,
        enabledBy: context?.userId,
      });
    } catch (error) {
      await logger.error('Failed to enable feature flag', error as Error, {
        featureName,
      });
      throw error;
    }
  }

  /**
   * Disable a feature flag
   */
  async disableFeature(featureName: string, context?: FeatureFlagContext): Promise<void> {
    try {
      this.flagOverrides.set(featureName, false);

      await logger.info('Feature flag disabled', {
        featureName,
        disabledBy: context?.userId,
      });
    } catch (error) {
      await logger.error('Failed to disable feature flag', error as Error, {
        featureName,
      });
      throw error;
    }
  }

  /**
   * Set a feature flag configuration
   */
  async setFeatureFlag(flag: FeatureFlag): Promise<void> {
    try {
      this.flags.set(flag.name, flag);

      await logger.info('Feature flag updated', {
        featureName: flag.name,
        enabled: flag.enabled,
      });
    } catch (error) {
      await logger.error('Failed to set feature flag', error as Error, {
        featureName: flag.name,
      });
      throw error;
    }
  }

  /**
   * Get all feature flags
   */
  getAllFeatureFlags(): FeatureFlag[] {
    return Array.from(this.flags.values());
  }

  /**
   * Get feature flag status for a user
   */
  getFeatureFlagsForUser(context: FeatureFlagContext): Record<string, boolean> {
    const userFlags: Record<string, boolean> = {};

    this.flags.forEach((flag, name) => {
      userFlags[name] = this.isFeatureEnabled(name, context);
    });

    return userFlags;
  }

  /**
   * Clear all feature flag overrides
   */
  async clearOverrides(): Promise<void> {
    try {
      this.flagOverrides.clear();

      await logger.info('All feature flag overrides cleared');
    } catch (error) {
      await logger.error('Failed to clear feature flag overrides', error as Error);
      throw error;
    }
  }

  /**
   * Hash string for consistent percentage-based rollouts
   */
  private hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Evaluate custom conditions for feature flags
   */
  private evaluateConditions(
    conditions: Record<string, any>,
    context?: FeatureFlagContext
  ): boolean {
    try {
      // Simple condition evaluation - can be extended for complex logic
      for (const [key, value] of Object.entries(conditions)) {
        switch (key) {
          case 'environment':
            if (context?.environment !== value) {
              return false;
            }
            break;

          case 'userAgent':
            if (context?.userAgent && !context.userAgent.includes(value)) {
              return false;
            }
            break;

          case 'customAttribute':
            if (context?.customAttributes?.[value.key] !== value.value) {
              return false;
            }
            break;

          default:
            // Unknown condition - fail safely
            return false;
        }
      }

      return true;
    } catch (error) {
      logger.warn('Condition evaluation failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        conditions,
      });

      return false;
    }
  }
}

// Export singleton instance
export const featureFlagService = FeatureFlagService.getInstance();

// Convenience functions
export function isFeatureEnabled(featureName: string, context?: FeatureFlagContext): boolean {
  return featureFlagService.isFeatureEnabled(featureName, context);
}

export function getAllFeatureFlags(): FeatureFlag[] {
  return featureFlagService.getAllFeatureFlags();
}

export function getUserFeatureFlags(context: FeatureFlagContext): Record<string, boolean> {
  return featureFlagService.getFeatureFlagsForUser(context);
}

export async function enableFeature(featureName: string, context?: FeatureFlagContext): Promise<void> {
  return featureFlagService.enableFeature(featureName, context);
}

export async function disableFeature(featureName: string, context?: FeatureFlagContext): Promise<void> {
  return featureFlagService.disableFeature(featureName, context);
}

// Note: React hooks would be implemented in a separate client-side utilities file
// This is a placeholder for the hook interface
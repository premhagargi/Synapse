/**
 * @fileoverview Comprehensive audit logging service for compliance and security monitoring
 */

import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
import { logger } from '@/shared/lib/logger';
import { AuditAction, AuditLog } from '@/shared/types';

export class AuditService {
  private static instance: AuditService;

  static getInstance(): AuditService {
    if (!AuditService.instance) {
      AuditService.instance = new AuditService();
    }
    return AuditService.instance;
  }

  /**
   * Log an audit event
   */
  async logEvent(
    userId: string,
    action: AuditAction,
    resource: string,
    details?: Record<string, any>,
    resourceId?: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<string> {
    try {
      const auditEntry = {
        userId,
        action,
        resource,
        resourceId,
        details: details || {},
        ipAddress,
        userAgent,
        timestamp: serverTimestamp(),
      };

      const docRef = await addDoc(collection(db, 'auditLogs'), auditEntry);

      // Also log to application logger for immediate visibility
      await logger.info(`Audit: ${action}`, {
        userId,
        resource,
        resourceId,
        details,
        auditLogId: docRef.id,
      });

      return docRef.id;
    } catch (error) {
      await logger.error('Failed to log audit event', error as Error, {
        userId,
        action,
        resource,
        resourceId,
      });

      // Don't throw - audit logging failures shouldn't break the application
      return '';
    }
  }

  /**
   * Log user authentication events
   */
  async logAuthEvent(
    userId: string,
    action: 'login' | 'logout' | 'signup' | 'password_reset' | 'password_change',
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const actionMap = {
      login: AuditAction.LOGIN,
      logout: AuditAction.LOGOUT,
      signup: AuditAction.SIGNUP,
      password_reset: AuditAction.SETTINGS_UPDATE,
      password_change: AuditAction.SETTINGS_UPDATE,
    };

    await this.logEvent(
      userId,
      actionMap[action],
      'auth',
      { authAction: action, ...details },
      undefined,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log document-related events
   */
  async logDocumentEvent(
    userId: string,
    action: 'upload' | 'analyze' | 'export' | 'delete' | 'view',
    documentId: string,
    details?: Record<string, any>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    const actionMap = {
      upload: AuditAction.DOCUMENT_UPLOAD,
      analyze: AuditAction.DOCUMENT_ANALYZE,
      export: AuditAction.DOCUMENT_EXPORT,
      delete: AuditAction.DOCUMENT_DELETE,
      view: AuditAction.DOCUMENT_ANALYZE, // Using analyze as closest match for viewing
    };

    await this.logEvent(
      userId,
      actionMap[action],
      'document',
      { documentAction: action, ...details },
      documentId,
      ipAddress,
      userAgent
    );
  }

  /**
   * Log AI analysis events
   */
  async logAIAnalysisEvent(
    userId: string,
    documentId: string,
    status: 'start' | 'complete' | 'error',
    details?: Record<string, any>,
    processingTime?: number,
    confidence?: number
  ): Promise<void> {
    const actionMap = {
      start: AuditAction.AI_ANALYSIS_START,
      complete: AuditAction.AI_ANALYSIS_COMPLETE,
      error: AuditAction.AI_ANALYSIS_ERROR,
    };

    await this.logEvent(
      userId,
      actionMap[status],
      'ai_analysis',
      {
        aiStatus: status,
        processingTime,
        confidence,
        ...details,
      },
      documentId
    );
  }

  /**
   * Log user management events
   */
  async logUserManagementEvent(
    adminUserId: string,
    action: 'create' | 'update' | 'delete' | 'role_change',
    targetUserId: string,
    details?: Record<string, any>
  ): Promise<void> {
    const actionMap = {
      create: AuditAction.USER_CREATE,
      update: AuditAction.USER_UPDATE,
      delete: AuditAction.USER_DELETE,
      role_change: AuditAction.USER_UPDATE,
    };

    await this.logEvent(
      adminUserId,
      actionMap[action],
      'user_management',
      { managementAction: action, targetUserId, ...details },
      targetUserId
    );
  }

  /**
   * Log system administration events
   */
  async logSystemEvent(
    adminUserId: string,
    action: 'settings_update' | 'feature_flag_change' | 'system_maintenance',
    details?: Record<string, any>,
    resourceId?: string
  ): Promise<void> {
    const actionMap = {
      settings_update: AuditAction.SETTINGS_UPDATE,
      feature_flag_change: AuditAction.SETTINGS_UPDATE,
      system_maintenance: AuditAction.SETTINGS_UPDATE,
    };

    await this.logEvent(
      adminUserId,
      actionMap[action],
      'system',
      { systemAction: action, ...details },
      resourceId
    );
  }

  /**
   * Query audit logs with filtering and pagination
   */
  async queryAuditLogs(
    filters: {
      userId?: string;
      action?: AuditAction;
      resource?: string;
      resourceId?: string;
      startDate?: Date;
      endDate?: Date;
    },
    pagination: {
      page: number;
      limit: number;
    }
  ): Promise<{
    logs: AuditLog[];
    total: number;
    hasMore: boolean;
  }> {
    try {
      let q = query(collection(db, 'auditLogs'));

      // Apply filters
      if (filters.userId) {
        q = query(q, where('userId', '==', filters.userId));
      }

      if (filters.action) {
        q = query(q, where('action', '==', filters.action));
      }

      if (filters.resource) {
        q = query(q, where('resource', '==', filters.resource));
      }

      if (filters.resourceId) {
        q = query(q, where('resourceId', '==', filters.resourceId));
      }

      if (filters.startDate) {
        q = query(q, where('timestamp', '>=', filters.startDate));
      }

      if (filters.endDate) {
        q = query(q, where('timestamp', '<=', filters.endDate));
      }

      // Order by timestamp (most recent first)
      q = query(q, orderBy('timestamp', 'desc'));

      // Apply pagination
      const offset = (pagination.page - 1) * pagination.limit;
      q = query(q, limit(pagination.limit + 1)); // +1 to check if there are more

      const querySnapshot = await getDocs(q);

      const logs: AuditLog[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          userId: data.userId,
          action: data.action,
          resource: data.resource,
          resourceId: data.resourceId,
          details: data.details,
          ipAddress: data.ipAddress,
          userAgent: data.userAgent,
          timestamp: data.timestamp?.toDate() || new Date(),
        });
      });

      const hasMore = logs.length > pagination.limit;
      if (hasMore) {
        logs.pop(); // Remove the extra item
      }

      return {
        logs,
        total: logs.length + (hasMore ? 1 : 0), // Approximation
        hasMore,
      };
    } catch (error) {
      await logger.error('Failed to query audit logs', error as Error, { filters, pagination });
      throw error;
    }
  }

  /**
   * Get audit logs for a specific user
   */
  async getUserAuditLogs(
    userId: string,
    options: {
      limit?: number;
      startDate?: Date;
      endDate?: Date;
    } = {}
  ): Promise<AuditLog[]> {
    const { limit: limitCount = 50, startDate, endDate } = options;

    return this.queryAuditLogs(
      { userId, startDate, endDate },
      { page: 1, limit: limitCount }
    ).then(result => result.logs);
  }

  /**
   * Get audit logs for a specific document
   */
  async getDocumentAuditLogs(
    documentId: string,
    options: {
      limit?: number;
    } = {}
  ): Promise<AuditLog[]> {
    const { limit: limitCount = 20 } = options;

    return this.queryAuditLogs(
      { resourceId: documentId },
      { page: 1, limit: limitCount }
    ).then(result => result.logs);
  }

  /**
   * Generate compliance report from audit logs
   */
  async generateComplianceReport(
    startDate: Date,
    endDate: Date,
    userId?: string
  ): Promise<{
    totalEvents: number;
    eventsByAction: Record<AuditAction, number>;
    eventsByResource: Record<string, number>;
    eventsByUser: Record<string, number>;
    securityEvents: AuditLog[];
    complianceScore: number;
  }> {
    try {
      const filters: any = { startDate, endDate };
      if (userId) {
        filters.userId = userId;
      }

      const { logs } = await this.queryAuditLogs(filters, { page: 1, limit: 1000 });

      const eventsByAction = logs.reduce((acc, log) => {
        acc[log.action] = (acc[log.action] || 0) + 1;
        return acc;
      }, {} as Record<AuditAction, number>);

      const eventsByResource = logs.reduce((acc, log) => {
        acc[log.resource] = (acc[log.resource] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const eventsByUser = logs.reduce((acc, log) => {
        acc[log.userId] = (acc[log.userId] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Identify security-relevant events
      const securityEvents = logs.filter(log =>
        [AuditAction.LOGIN, AuditAction.LOGOUT, AuditAction.USER_CREATE, AuditAction.USER_DELETE].includes(log.action)
      );

      // Calculate compliance score (simplified)
      const totalSecurityEvents = securityEvents.length;
      const failedLogins = logs.filter(log => log.action === AuditAction.LOGIN && log.details?.error).length;
      const complianceScore = Math.max(0, 100 - (failedLogins * 5) - (totalSecurityEvents * 0.1));

      return {
        totalEvents: logs.length,
        eventsByAction,
        eventsByResource,
        eventsByUser,
        securityEvents,
        complianceScore: Math.round(complianceScore),
      };
    } catch (error) {
      await logger.error('Failed to generate compliance report', error as Error, {
        startDate,
        endDate,
        userId,
      });
      throw error;
    }
  }
}

// Export singleton instance
export const auditService = AuditService.getInstance();

// Convenience functions for common audit operations
export async function logUserLogin(
  userId: string,
  details?: Record<string, any>,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await auditService.logAuthEvent(userId, 'login', details, ipAddress, userAgent);
}

export async function logUserLogout(
  userId: string,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await auditService.logAuthEvent(userId, 'logout', {}, ipAddress, userAgent);
}

export async function logDocumentUpload(
  userId: string,
  documentId: string,
  fileName: string,
  fileSize: number,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  await auditService.logDocumentEvent(
    userId,
    'upload',
    documentId,
    { fileName, fileSize },
    ipAddress,
    userAgent
  );
}

export async function logDocumentAnalysis(
  userId: string,
  documentId: string,
  status: 'start' | 'complete' | 'error',
  processingTime?: number,
  confidence?: number
): Promise<void> {
  await auditService.logAIAnalysisEvent(
    userId,
    documentId,
    status,
    { processingTime, confidence },
    processingTime,
    confidence
  );
}

export async function logUserCreation(
  adminUserId: string,
  newUserId: string,
  newUserRole: string
): Promise<void> {
  await auditService.logUserManagementEvent(
    adminUserId,
    'create',
    newUserId,
    { newUserRole }
  );
}
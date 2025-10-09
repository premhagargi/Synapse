/**
 * @fileoverview Centralized logging utilities for the application
 */

import { AuditAction } from '@/shared/types';

// Log levels
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  WARN = 2,
  ERROR = 3,
  FATAL = 4,
}

// Log entry interface
export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  message: string;
  context?: Record<string, any>;
  error?: Error;
  userId?: string;
  action?: AuditAction;
  resource?: string;
  resourceId?: string;
}

// Logger class
class Logger {
  private minLevel: LogLevel;
  private enableConsole: boolean;
  private enableAudit: boolean;

  constructor(options: {
    minLevel?: LogLevel;
    enableConsole?: boolean;
    enableAudit?: boolean;
  } = {}) {
    this.minLevel = options.minLevel ?? LogLevel.INFO;
    this.enableConsole = options.enableConsole ?? true;
    this.enableAudit = options.enableAudit ?? false;
  }

  private shouldLog(level: LogLevel): boolean {
    return level >= this.minLevel;
  }

  private formatMessage(entry: LogEntry): string {
    const timestamp = entry.timestamp.toISOString();
    const level = LogLevel[entry.level];
    const userInfo = entry.userId ? ` [User: ${entry.userId}]` : '';
    const resourceInfo = entry.resource ? ` [${entry.resource}${entry.resourceId ? `:${entry.resourceId}` : ''}]` : '';

    return `${timestamp} [${level}]${userInfo}${resourceInfo} ${entry.message}`;
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.enableConsole) return;

    const message = this.formatMessage(entry);

    switch (entry.level) {
      case LogLevel.DEBUG:
        console.debug(message, entry.context);
        break;
      case LogLevel.INFO:
        console.info(message, entry.context);
        break;
      case LogLevel.WARN:
        console.warn(message, entry.context);
        break;
      case LogLevel.ERROR:
      case LogLevel.FATAL:
        console.error(message, entry.error || entry.context);
        break;
    }
  }

  private async logToAudit(entry: LogEntry): Promise<void> {
    if (!this.enableAudit || !entry.userId) return;

    try {
      // In a real implementation, this would write to your audit log storage
      // For now, we'll just store in memory (replace with actual audit logging)
      const auditEntry = {
        id: crypto.randomUUID(),
        userId: entry.userId,
        action: entry.action || AuditAction.SETTINGS_UPDATE,
        resource: entry.resource || 'system',
        resourceId: entry.resourceId,
        details: {
          level: LogLevel[entry.level],
          message: entry.message,
          context: entry.context,
          error: entry.error?.message,
        },
        timestamp: entry.timestamp,
      };

      // TODO: Implement actual audit log storage (Firestore, external service, etc.)
      console.log('AUDIT LOG:', JSON.stringify(auditEntry));
    } catch (error) {
      console.error('Failed to write audit log:', error);
    }
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, any>,
    error?: Error,
    userId?: string,
    action?: AuditAction,
    resource?: string,
    resourceId?: string
  ): LogEntry {
    return {
      timestamp: new Date(),
      level,
      message,
      context,
      error,
      userId,
      action,
      resource,
      resourceId,
    };
  }

  async log(
    level: LogLevel,
    message: string,
    options: {
      context?: Record<string, any>;
      error?: Error;
      userId?: string;
      action?: AuditAction;
      resource?: string;
      resourceId?: string;
    } = {}
  ): Promise<void> {
    if (!this.shouldLog(level)) return;

    const entry = this.createLogEntry(
      level,
      message,
      options.context,
      options.error,
      options.userId,
      options.action,
      options.resource,
      options.resourceId
    );

    this.logToConsole(entry);

    if (level >= LogLevel.WARN || options.action) {
      await this.logToAudit(entry);
    }
  }

  async debug(message: string, context?: Record<string, any>, userId?: string): Promise<void> {
    await this.log(LogLevel.DEBUG, message, { context, userId });
  }

  async info(message: string, context?: Record<string, any>, userId?: string): Promise<void> {
    await this.log(LogLevel.INFO, message, { context, userId });
  }

  async warn(message: string, context?: Record<string, any>, userId?: string): Promise<void> {
    await this.log(LogLevel.WARN, message, { context, userId });
  }

  async error(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await this.log(LogLevel.ERROR, message, { error, context, userId });
  }

  async fatal(
    message: string,
    error?: Error,
    context?: Record<string, any>,
    userId?: string
  ): Promise<void> {
    await this.log(LogLevel.FATAL, message, { error, context, userId });
  }

  // Action-specific logging methods
  async logUserAction(
    action: AuditAction,
    userId: string,
    resource: string,
    resourceId?: string,
    context?: Record<string, any>
  ): Promise<void> {
    await this.log(LogLevel.INFO, `User action: ${action}`, {
      context,
      userId,
      action,
      resource,
      resourceId,
    });
  }

  async logDocumentAction(
    action: AuditAction,
    userId: string,
    documentId: string,
    context?: Record<string, any>
  ): Promise<void> {
    await this.logUserAction(action, userId, 'document', documentId, context);
  }

  async logAIAnalysis(
    userId: string,
    documentId: string,
    status: 'start' | 'complete' | 'error',
    context?: Record<string, any>
  ): Promise<void> {
    const action = status === 'start'
      ? AuditAction.AI_ANALYSIS_START
      : status === 'complete'
      ? AuditAction.AI_ANALYSIS_COMPLETE
      : AuditAction.AI_ANALYSIS_ERROR;

    await this.logUserAction(action, userId, 'document', documentId, {
      ...context,
      analysisStatus: status,
    });
  }
}

// Create and export logger instance
export const logger = new Logger({
  minLevel: process.env.NODE_ENV === 'development' ? LogLevel.DEBUG : LogLevel.INFO,
  enableConsole: true,
  enableAudit: true,
});

// Convenience functions for common logging patterns
export async function logError(
  error: Error,
  context?: Record<string, any>,
  userId?: string
): Promise<void> {
  await logger.error(error.message, error, context, userId);
}

export async function logUserLogin(userId: string, context?: Record<string, any>): Promise<void> {
  await logger.logUserAction(AuditAction.LOGIN, userId, 'auth', undefined, context);
}

export async function logUserLogout(userId: string): Promise<void> {
  await logger.logUserAction(AuditAction.LOGOUT, userId, 'auth');
}

export async function logDocumentUpload(
  userId: string,
  documentId: string,
  fileName: string,
  fileSize: number
): Promise<void> {
  await logger.logDocumentAction(AuditAction.DOCUMENT_UPLOAD, userId, documentId, {
    fileName,
    fileSize,
  });
}

export async function logDocumentAnalysis(
  userId: string,
  documentId: string,
  status: 'start' | 'complete' | 'error',
  processingTime?: number
): Promise<void> {
  await logger.logAIAnalysis(userId, documentId, status, { processingTime });
}
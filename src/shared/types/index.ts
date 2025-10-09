/**
 * @fileoverview Shared TypeScript types and interfaces for the application
 */

// User and Authentication Types
export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  role: UserRole;
  subscription: Subscription;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  ANALYST = 'analyst',
  VIEWER = 'viewer'
}

export interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  stripeCustomerId?: string;
  currentPeriodEnd?: Date;
}

export enum SubscriptionTier {
  FREE = 'free',
  PRO = 'pro',
  ENTERPRISE = 'enterprise'
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELLED = 'cancelled',
  PAST_DUE = 'past_due',
  UNPAID = 'unpaid'
}

// Document Types
export interface Document {
  id: string;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  mimeType: string;
  status: DocumentStatus;
  analysis?: DocumentAnalysis;
  version: number;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export enum DocumentStatus {
  UPLOADING = 'uploading',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

// AI Analysis Types
export interface DocumentAnalysis {
  id: string;
  documentId: string;
  summary: string[];
  extractedData: ExtractedData;
  complianceIssues: ComplianceIssue[];
  confidence: number;
  reasoning: string[];
  processingTime: number;
  version: string;
  createdAt: Date;
}

export interface ExtractedData {
  partyNames: string[];
  investmentAmount?: string;
  effectiveDate?: string;
  terminationDate?: string;
  keyDeadlines: string[];
  [key: string]: any;
}

export interface ComplianceIssue {
  id: string;
  auditArea: string;
  summary: string;
  classification: ComplianceClassification;
  severity: ComplianceSeverity;
  reasoning: string;
  recommendations?: string[];
}

export enum ComplianceClassification {
  COMPLIANCE_ISSUE = 'compliance_issue',
  INTERNAL_PROCESS_ISSUE = 'internal_process_issue'
}

export enum ComplianceSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Audit Log Types
export interface AuditLog {
  id: string;
  userId: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: Date;
}

export enum AuditAction {
  // Auth actions
  LOGIN = 'login',
  LOGOUT = 'logout',
  SIGNUP = 'signup',

  // Document actions
  DOCUMENT_UPLOAD = 'document_upload',
  DOCUMENT_DELETE = 'document_delete',
  DOCUMENT_ANALYZE = 'document_analyze',
  DOCUMENT_EXPORT = 'document_export',

  // AI actions
  AI_ANALYSIS_START = 'ai_analysis_start',
  AI_ANALYSIS_COMPLETE = 'ai_analysis_complete',
  AI_ANALYSIS_ERROR = 'ai_analysis_error',

  // Admin actions
  USER_CREATE = 'user_create',
  USER_UPDATE = 'user_update',
  USER_DELETE = 'user_delete',
  SETTINGS_UPDATE = 'settings_update'
}

// Analytics Types
export interface AnalyticsData {
  totalDocuments: number;
  totalUsers: number;
  complianceIssues: number;
  averageProcessingTime: number;
  riskDistribution: RiskDistribution[];
  userActivity: UserActivity[];
  period: AnalyticsPeriod;
}

export interface RiskDistribution {
  classification: ComplianceClassification;
  severity: ComplianceSeverity;
  count: number;
}

export interface UserActivity {
  date: string;
  uploads: number;
  analyses: number;
  logins: number;
}

export enum AnalyticsPeriod {
  LAST_7_DAYS = 'last_7_days',
  LAST_30_DAYS = 'last_30_days',
  LAST_90_DAYS = 'last_90_days',
  LAST_YEAR = 'last_year'
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Feature Flag Types
export interface FeatureFlags {
  experimentalGenkitFlows: boolean;
  enterpriseMode: boolean;
  advancedAnalytics: boolean;
  exportFeatures: boolean;
  chatInterface: boolean;
}

// Error Types
export interface AppError {
  code: string;
  message: string;
  statusCode: number;
  details?: Record<string, any>;
}

// Export Options
export enum ExportFormat {
  PDF = 'pdf',
  CSV = 'csv',
  JSON = 'json',
  EXCEL = 'excel'
}

export interface ExportOptions {
  format: ExportFormat;
  includeAnalysis: boolean;
  includeMetadata: boolean;
  dateRange?: {
    start: Date;
    end: Date;
  };
}
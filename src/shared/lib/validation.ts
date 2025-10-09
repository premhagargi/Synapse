/**
 * @fileoverview Shared validation utilities and schemas
 */

import { z } from 'zod';
import { DocumentStatus, UserRole, SubscriptionTier } from '@/shared/types';

// Base validation schemas
export const emailSchema = z.string().email('Invalid email address');

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least one lowercase letter, one uppercase letter, and one number');

export const uuidSchema = z.string().uuid('Invalid UUID format');

// User validation schemas
export const userRoleSchema = z.nativeEnum(UserRole);

export const subscriptionTierSchema = z.nativeEnum(SubscriptionTier);

export const createUserSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  displayName: z.string().min(1, 'Display name is required').max(100, 'Display name too long'),
  role: userRoleSchema.default(UserRole.VIEWER),
});

export const updateUserSchema = z.object({
  displayName: z.string().min(1).max(100).optional(),
  role: userRoleSchema.optional(),
});

// Document validation schemas
export const documentStatusSchema = z.nativeEnum(DocumentStatus);

export const createDocumentSchema = z.object({
  fileName: z.string().min(1, 'File name is required').max(255, 'File name too long'),
  fileSize: z.number().positive('File size must be positive'),
  fileType: z.string().min(1, 'File type is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
});

export const updateDocumentSchema = z.object({
  fileName: z.string().min(1).max(255).optional(),
  status: documentStatusSchema.optional(),
});

// File upload validation
export const fileUploadSchema = z.object({
  file: z.instanceof(File, { message: 'File is required' })
    .refine(file => file.size > 0, 'File cannot be empty')
    .refine(file => file.size <= 10 * 1024 * 1024, 'File size must be less than 10MB')
    .refine(
      file => [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png'
      ].includes(file.type),
      'File type not supported'
    ),
});

// Analysis validation schemas
export const complianceClassificationSchema = z.enum(['compliance_issue', 'internal_process_issue']);

export const complianceSeveritySchema = z.enum(['low', 'medium', 'high', 'critical']);

export const complianceIssueSchema = z.object({
  auditArea: z.string().min(1, 'Audit area is required'),
  summary: z.string().min(1, 'Summary is required'),
  classification: complianceClassificationSchema,
  severity: complianceSeveritySchema,
  reasoning: z.string().min(1, 'Reasoning is required'),
  recommendations: z.array(z.string()).optional(),
});

export const extractedDataSchema = z.object({
  partyNames: z.array(z.string()),
  investmentAmount: z.string().optional(),
  effectiveDate: z.string().optional(),
  terminationDate: z.string().optional(),
  keyDeadlines: z.array(z.string()),
});

export const documentAnalysisSchema = z.object({
  summary: z.array(z.string()).min(1, 'At least one summary point is required'),
  extractedData: extractedDataSchema,
  complianceIssues: z.array(complianceIssueSchema),
  confidence: z.number().min(0).max(100),
  reasoning: z.array(z.string()),
  processingTime: z.number().positive(),
});

// API validation schemas
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  limit: z.number().int().positive().max(100).default(20),
});

export const dateRangeSchema = z.object({
  start: z.string().datetime(),
  end: z.string().datetime(),
}).refine(
  data => new Date(data.start) <= new Date(data.end),
  'Start date must be before or equal to end date'
);

// Search and filter schemas
export const documentFiltersSchema = z.object({
  status: documentStatusSchema.optional(),
  fileType: z.string().optional(),
  dateRange: dateRangeSchema.optional(),
  search: z.string().optional(),
});

export const sortOrderSchema = z.enum(['asc', 'desc']);

export const documentSortSchema = z.object({
  field: z.enum(['createdAt', 'fileName', 'fileSize', 'status']),
  order: sortOrderSchema.default('desc'),
});

// Export validation schemas
export const exportFormatSchema = z.enum(['pdf', 'csv', 'json', 'excel']);

export const exportOptionsSchema = z.object({
  format: exportFormatSchema,
  includeAnalysis: z.boolean().default(true),
  includeMetadata: z.boolean().default(true),
  dateRange: dateRangeSchema.optional(),
});

// Audit log validation schemas
export const auditActionSchema = z.enum([
  'login', 'logout', 'signup',
  'document_upload', 'document_delete', 'document_analyze', 'document_export',
  'ai_analysis_start', 'ai_analysis_complete', 'ai_analysis_error',
  'user_create', 'user_update', 'user_delete', 'settings_update'
]);

export const createAuditLogSchema = z.object({
  userId: uuidSchema,
  action: auditActionSchema,
  resource: z.string().min(1, 'Resource is required'),
  resourceId: uuidSchema.optional(),
  details: z.record(z.any()).optional(),
  ipAddress: z.string().optional(),
  userAgent: z.string().optional(),
});

// Analytics validation schemas
export const analyticsPeriodSchema = z.enum(['last_7_days', 'last_30_days', 'last_90_days', 'last_year']);

export const analyticsFiltersSchema = z.object({
  period: analyticsPeriodSchema.default('last_30_days'),
  userId: uuidSchema.optional(),
  documentType: z.string().optional(),
});

// Validation utility functions
export function validateData<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: true; data: T
} | {
  success: false; errors: z.ZodError
} {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  return { success: false, errors: result.error };
}

export function getValidationErrorMessage(error: z.ZodError): string {
  return error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ');
}

// Type exports for use in components
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type CreateDocumentInput = z.infer<typeof createDocumentSchema>;
export type UpdateDocumentInput = z.infer<typeof updateDocumentSchema>;
export type FileUploadInput = z.infer<typeof fileUploadSchema>;
export type DocumentAnalysisInput = z.infer<typeof documentAnalysisSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type DocumentFiltersInput = z.infer<typeof documentFiltersSchema>;
export type DocumentSortInput = z.infer<typeof documentSortSchema>;
export type ExportOptionsInput = z.infer<typeof exportOptionsSchema>;
export type CreateAuditLogInput = z.infer<typeof createAuditLogSchema>;
export type AnalyticsFiltersInput = z.infer<typeof analyticsFiltersSchema>;
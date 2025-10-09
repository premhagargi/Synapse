import { z } from 'zod';

/**
 * @fileOverview Enhanced Zod schemas and TypeScript types for AI flows with comprehensive validation.
 * This file does not use 'use server' and can be safely imported on both client and server.
 */

// Base schemas for common fields
export const uuidSchema = z.string().uuid('Invalid UUID format');
export const emailSchema = z.string().email('Invalid email address');
export const urlSchema = z.string().url('Invalid URL format');
export const dateStringSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be in YYYY-MM-DD format');

// Document input schemas
export const DocumentAnalysisInputSchema = z.object({
  fileName: z.string()
    .min(1, 'File name is required')
    .max(255, 'File name must be less than 255 characters')
    .describe('The name of the document file.'),
  fileContent: z
    .string()
    .min(1, 'File content is required')
    .refine(
      (content) => content.startsWith('data:'),
      'File content must be a valid data URI starting with "data:"'
    )
    .refine(
      (content) => content.includes(';base64,'),
      'File content must be base64 encoded with proper data URI format'
    )
    .describe(
      "The content of the document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  metadata: z.object({
    fileSize: z.number().positive('File size must be positive').optional(),
    mimeType: z.string().min(1, 'MIME type is required').optional(),
    uploadedBy: uuidSchema.optional(),
    uploadedAt: z.string().datetime().optional(),
  }).optional(),
});

export type DocumentAnalysisInput = z.infer<typeof DocumentAnalysisInputSchema>;

// Enhanced compliance issue schema with severity and recommendations
export const ComplianceIssueSchema = z.object({
  id: uuidSchema.optional(),
  auditArea: z.string()
    .min(1, 'Audit area is required')
    .max(100, 'Audit area must be less than 100 characters')
    .describe("The area of the audit the finding relates to (e.g., 'Access Control', 'Data Encryption')."),
  summary: z.string()
    .min(1, 'Summary is required')
    .max(500, 'Summary must be less than 500 characters')
    .describe("A concise summary of the finding."),
  classification: z.enum(['compliance_issue', 'internal_process_issue'])
    .describe("Classification of the finding."),
  severity: z.enum(['low', 'medium', 'high', 'critical'])
    .default('medium')
    .describe("Severity level of the compliance issue."),
  reasoning: z.string()
    .min(1, 'Reasoning is required')
    .max(1000, 'Reasoning must be less than 1000 characters')
    .describe("A detailed justification for the classification, explaining the violation or deviation."),
  recommendations: z.array(z.string()
    .min(1, 'Recommendation cannot be empty')
    .max(200, 'Recommendation must be less than 200 characters')
  ).max(5, 'Maximum 5 recommendations allowed').optional(),
  references: z.array(z.object({
    title: z.string().min(1).max(100),
    url: urlSchema.optional(),
    section: z.string().optional(),
  })).max(3, 'Maximum 3 references allowed').optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

// Enhanced extracted data schema with more comprehensive fields
export const ExtractedDataSchema = z.object({
  partyNames: z.array(z.string()
    .min(1, 'Party name cannot be empty')
    .max(100, 'Party name must be less than 100 characters')
  ).min(1, 'At least one party name is required')
    .describe('Names of all parties involved (people, companies).'),
  investmentAmount: z.string()
    .regex(/^\$?[\d,]+(\.\d{2})?$/, 'Investment amount must be in valid currency format')
    .optional()
    .describe('The primary investment amount or financial figure.'),
  effectiveDate: dateStringSchema.optional()
    .describe('The effective date or start date of the agreement.'),
  terminationDate: dateStringSchema.optional()
    .describe('The termination or expiration date, if any.'),
  keyDeadlines: z.array(z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Deadline must be in YYYY-MM-DD format')
  ).max(10, 'Maximum 10 deadlines allowed')
    .describe('A list of critical dates or deadlines mentioned.'),
  documentType: z.enum([
    'investment_agreement',
    'compliance_report',
    'contract',
    'financial_statement',
    'regulatory_filing',
    'other'
  ]).describe('Type of document being analyzed.'),
  jurisdiction: z.string()
    .max(100, 'Jurisdiction must be less than 100 characters')
    .optional()
    .describe('Legal jurisdiction or regulatory framework.'),
  currency: z.string()
    .length(3, 'Currency must be 3 characters (ISO 4217)')
    .default('USD')
    .describe('Currency code for financial amounts.'),
}).describe('Comprehensive structured data extracted from the document.');

// Main document analysis schema with enhanced fields
export const DocumentAnalysisSchema = z.object({
  id: uuidSchema.optional(),
  documentId: uuidSchema.optional(),
  summary: z
    .array(z.string()
      .min(1, 'Summary point cannot be empty')
      .max(200, 'Summary point must be less than 200 characters')
    )
    .min(1, 'At least one summary point is required')
    .max(10, 'Maximum 10 summary points allowed')
    .describe(
      'A concise, executive-friendly summary of the document in 3-5 bullet points.'
    ),
  extractedData: ExtractedDataSchema,
  complianceIssues: z
    .array(ComplianceIssueSchema)
    .max(50, 'Maximum 50 compliance issues allowed')
    .describe(
      'A list of potential compliance risks, non-standard clauses, or missing information flagged for review.'
    ),
  confidence: z.number()
    .min(0, 'Confidence must be at least 0')
    .max(100, 'Confidence must be at most 100')
    .describe('Confidence score for the analysis (0-100).'),
  reasoning: z.array(z.string()
    .min(1, 'Reasoning point cannot be empty')
    .max(300, 'Reasoning point must be less than 300 characters')
  ).min(1, 'At least one reasoning point is required')
    .describe('Detailed reasoning for the analysis and classifications.'),
  processingTime: z.number()
    .positive('Processing time must be positive')
    .describe('Time taken to process the document in milliseconds.'),
  version: z.string()
    .default('1.0')
    .describe('Version of the analysis schema.'),
  model: z.string()
    .default('gemini-2.0-flash')
    .describe('AI model used for analysis.'),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type DocumentAnalysis = z.infer<typeof DocumentAnalysisSchema>;
export type ComplianceIssue = z.infer<typeof ComplianceIssueSchema>;
export type ExtractedData = z.infer<typeof ExtractedDataSchema>;

// Chat/Q&A schemas for follow-up questions
export const ChatMessageSchema = z.object({
  id: uuidSchema.optional(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string()
    .min(1, 'Message content is required')
    .max(4000, 'Message content must be less than 4000 characters'),
  timestamp: z.string().datetime().optional(),
  metadata: z.object({
    documentId: uuidSchema.optional(),
    confidence: z.number().min(0).max(100).optional(),
    sources: z.array(z.string()).optional(),
  }).optional(),
});

export const ChatSessionSchema = z.object({
  id: uuidSchema.optional(),
  userId: uuidSchema,
  documentId: uuidSchema,
  title: z.string().min(1).max(200),
  messages: z.array(ChatMessageSchema),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});

export type ChatMessage = z.infer<typeof ChatMessageSchema>;
export type ChatSession = z.infer<typeof ChatSessionSchema>;

// Batch analysis schema for multiple documents
export const BatchAnalysisInputSchema = z.object({
  documents: z.array(DocumentAnalysisInputSchema)
    .min(1, 'At least one document is required')
    .max(10, 'Maximum 10 documents per batch'),
  options: z.object({
    priority: z.enum(['low', 'normal', 'high']).default('normal'),
    includeChat: z.boolean().default(false),
    webhookUrl: urlSchema.optional(),
  }).optional(),
});

export type BatchAnalysisInput = z.infer<typeof BatchAnalysisInputSchema>;

// Export schemas
export const ExportRequestSchema = z.object({
  documentIds: z.array(uuidSchema)
    .min(1, 'At least one document ID is required')
    .max(50, 'Maximum 50 documents per export'),
  format: z.enum(['pdf', 'csv', 'json', 'excel']),
  options: z.object({
    includeAnalysis: z.boolean().default(true),
    includeMetadata: z.boolean().default(true),
    includeChatHistory: z.boolean().default(false),
    dateRange: z.object({
      start: dateStringSchema,
      end: dateStringSchema,
    }).optional(),
  }).optional(),
});

export type ExportRequest = z.infer<typeof ExportRequestSchema>;

// Validation utility functions
export function validateDocumentAnalysisInput(data: unknown): {
  success: true; data: DocumentAnalysisInput
} | {
  success: false; errors: z.ZodError
} {
  return DocumentAnalysisInputSchema.safeParse(data) as any;
}

export function validateDocumentAnalysis(data: unknown): {
  success: true; data: DocumentAnalysis
} | {
  success: false; errors: z.ZodError
} {
  return DocumentAnalysisSchema.safeParse(data) as any;
}

export function validateComplianceIssue(data: unknown): {
  success: true; data: ComplianceIssue
} | {
  success: false; errors: z.ZodError
} {
  return ComplianceIssueSchema.safeParse(data) as any;
}

// Type guards
export function isValidDocumentAnalysis(data: any): data is DocumentAnalysis {
  return DocumentAnalysisSchema.safeParse(data).success;
}

export function isValidComplianceIssue(data: any): data is ComplianceIssue {
  return ComplianceIssueSchema.safeParse(data).success;
}

export function isValidChatMessage(data: any): data is ChatMessage {
  return ChatMessageSchema.safeParse(data).success;
}

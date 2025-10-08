import { z } from 'genkit';

/**
 * @fileOverview Defines the Zod schemas and TypeScript types for AI flows.
 * This file does not use 'use server' and can be safely imported on both client and server.
 */

export const DocumentAnalysisInputSchema = z.object({
  fileName: z.string().describe('The name of the document file.'),
  fileContent: z
    .string()
    .describe(
      "The content of the document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type DocumentAnalysisInput = z.infer<
  typeof DocumentAnalysisInputSchema
>;

export const DocumentAnalysisSchema = z.object({
  summary: z
    .string()
    .describe(
      'A concise, executive-friendly summary of the document in 3-5 bullet points.'
    ),
  extractedData: z
    .object({
      partyNames: z.array(z.string()).describe('Names of all parties involved (people, companies).'),
      investmentAmount: z.string().optional().describe('The primary investment amount or financial figure.'),
      effectiveDate: z.string().optional().describe('The effective date or start date of the agreement.'),
      terminationDate: z.string().optional().describe('The termination or expiration date, if any.'),
      keyDeadlines: z.array(z.string()).describe('A list of critical dates or deadlines mentioned.'),
    })
    .describe('Structured data extracted from the document.'),
  complianceIssues: z
    .array(z.string())
    .describe(
      'A list of potential compliance risks, non-standard clauses, or missing information flagged for review.'
    ),
});
export type DocumentAnalysis = z.infer<typeof DocumentAnalysisSchema>;

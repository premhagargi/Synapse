'use server';
/**
 * @fileOverview A flow for analyzing financial and compliance documents.
 *
 * - analyzeDocument - A function that orchestrates the document analysis process.
 * - DocumentAnalysisInput - The input type for the analysis flow.
 * - DocumentAnalysis - The output type (the analysis result).
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

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

const analysisPrompt = ai.definePrompt({
  name: 'documentAnalysisPrompt',
  input: { schema: DocumentAnalysisInputSchema },
  output: { schema: DocumentAnalysisSchema },
  prompt: `You are an expert AI assistant specializing in financial and compliance document analysis.
Your task is to carefully analyze the provided document and extract key information, summarize its content, and identify potential compliance issues.

Document to analyze: {{{fileName}}}
Content: {{media url=fileContent}}

Perform the following actions:
1.  **Summarize:** Create a brief, professional summary (3-5 bullet points) that an executive could quickly understand.
2.  **Extract Data:** Pull out the structured data as defined in the output schema. If a field is not present (e.g., no investment amount), omit it. Dates should be in YYYY-MM-DD format if possible.
3.  **Flag Compliance Issues:** Identify any potential risks, unusual terms, missing signatures, or clauses that deviate from standard compliance practices. If no issues are found, return an empty array.

Produce the output in the specified JSON format.
`,
});

const analyzeDocumentFlow = ai.defineFlow(
  {
    name: 'analyzeDocumentFlow',
    inputSchema: DocumentAnalysisInputSchema,
    outputSchema: DocumentAnalysisSchema,
  },
  async (input) => {
    const { output } = await analysisPrompt(input);
    if (!output) {
      throw new Error('Analysis failed to produce an output.');
    }
    return output;
  }
);

export async function analyzeDocument(input: DocumentAnalysisInput): Promise<DocumentAnalysis> {
  return analyzeDocumentFlow(input);
}

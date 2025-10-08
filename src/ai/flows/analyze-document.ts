'use server';
/**
 * @fileOverview A flow for analyzing financial and compliance documents.
 *
 * - analyzeDocument - A function that orchestrates the document analysis process.
 */

import { ai } from '@/ai/genkit';
import {
  DocumentAnalysisInputSchema,
  type DocumentAnalysisInput,
  DocumentAnalysisSchema,
  type DocumentAnalysis,
} from '@/ai/schemas';


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

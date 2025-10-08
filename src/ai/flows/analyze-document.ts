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
  prompt: `You are an AI compliance analyst. Your task is to evaluate a list of audit findings and determine whether each finding represents a true compliance issue or a non-compliance/internal process issue.

For each audit finding, consider:

Whether it violates laws, regulations, or formal internal policies.

Whether it could lead to regulatory, legal, or contractual consequences.

The severity and impact of the finding in the context of industry standards (ISO, SOC 2, SOX, GDPR, etc.).

Minor procedural, documentation, or operational deviations without regulatory impact should not be classified as compliance issues.
Your task is to carefully analyze the provided document and perform the following actions:

Document to analyze: {{{fileName}}}
Content: {{media url=fileContent}}

1.  **Summarize:** Create a brief, professional summary (3-5 bullet points) that an executive could quickly understand.

2.  **Extract Data:** Pull out the structured data as defined in the output schema. If a field is not present (e.g., no investment amount), omit it. Dates should be in YYYY-MM-DD format if possible.

3.  **Classify Findings:** For each potential issue you identify, you must determine whether it represents a true compliance issue or a non-compliance/internal process issue.
    - A "Compliance Issue" is a violation of laws, regulations, or formal internal policies that could lead to regulatory, legal, or contractual consequences. Consider standards like ISO, SOC 2, SOX, GDPR, etc.
    - An "Internal/Process Issue" is a minor procedural, documentation, or operational deviation without direct regulatory or legal impact.

For each finding, you must provide:
- **Audit Area**: The area the finding relates to (e.g., 'Access Control', 'Data Encryption', 'Contractual Terms').
- **Finding Summary**: A concise summary of the issue.
- **Classification**: "Compliance Issue" or "Internal/Process Issue".
- **Reasoning**: A short justification explaining why it is classified that way.

If no issues are found, return an empty array for complianceIssues. Produce the final output in the specified JSON format.
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

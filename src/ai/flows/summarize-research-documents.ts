// src/ai/flows/summarize-research-documents.ts
'use server';

/**
 * @fileOverview Summarizes uploaded research documents to provide key findings.
 *
 * - summarizeResearchDocument - A function that handles the research document summarization process.
 * - SummarizeResearchDocumentInput - The input type for the summarizeResearchDocument function.
 * - SummarizeResearchDocumentOutput - The return type for the summarizeResearchDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';
import { pdfExtract } from '@/services/pdf-extract';

const SummarizeResearchDocumentInputSchema = z.object({
  documentDataUri: z
    .string()
    .describe(
      "Research document, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type SummarizeResearchDocumentInput = z.infer<typeof SummarizeResearchDocumentInputSchema>;

const SummarizeResearchDocumentOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the research document.'),
});
export type SummarizeResearchDocumentOutput = z.infer<typeof SummarizeResearchDocumentOutputSchema>;

export async function summarizeResearchDocument(input: SummarizeResearchDocumentInput): Promise<SummarizeResearchDocumentOutput> {
  return summarizeResearchDocumentFlow(input);
}

const summarizeResearchDocumentPrompt = ai.definePrompt({
  name: 'summarizeResearchDocumentPrompt',
  input: { schema: z.object({ documentText: z.string() }) },
  output: {schema: SummarizeResearchDocumentOutputSchema},
  prompt: `You are an expert research assistant.  Your job is to summarize research documents.

  Document: {{{documentText}}}
  `,
});

const summarizeResearchDocumentFlow = ai.defineFlow(
  {
    name: 'summarizeResearchDocumentFlow',
    inputSchema: SummarizeResearchDocumentInputSchema,
    outputSchema: SummarizeResearchDocumentOutputSchema,
  },
  async input => {
    const pdfText = await pdfExtract(input.documentDataUri);

    const {output} = await summarizeResearchDocumentPrompt({
      documentText: pdfText,
    });
    return output!;
  }
);

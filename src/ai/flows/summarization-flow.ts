/**
 * @fileoverview Document summarization flow for generating executive summaries
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { logger } from '@/shared/lib/logger';

// Summarization input schema
const SummarizationInputSchema = z.object({
  documentId: z.string().uuid(),
  fileName: z.string(),
  fileContent: z.string(),
  entities: z.object({
    partyNames: z.array(z.string()),
    investmentAmount: z.string().optional(),
    effectiveDate: z.string().optional(),
    terminationDate: z.string().optional(),
    keyDeadlines: z.array(z.string()),
  }).optional(),
  complianceIssues: z.array(z.object({
    summary: z.string(),
    severity: z.string(),
    classification: z.string(),
  })).optional(),
  summaryType: z.enum(['executive', 'technical', 'compliance', 'financial']).default('executive'),
  maxLength: z.number().min(100).max(2000).default(500),
});

// Summarization output schema
const SummarizationSchema = z.object({
  documentId: z.string().uuid(),
  summary: z.array(z.string()).min(1).max(10),
  summaryType: z.string(),
  keyPoints: z.array(z.string()).max(5),
  confidence: z.number().min(0).max(100),
  reasoning: z.array(z.string()),
  processingTime: z.number(),
  wordCount: z.number(),
});

export type SummarizationInput = z.infer<typeof SummarizationInputSchema>;
export type Summarization = z.infer<typeof SummarizationSchema>;

// Summarization prompt
const summarizationPrompt = ai.definePrompt({
  name: 'summarizationPrompt',
  input: { schema: SummarizationInputSchema },
  output: { schema: SummarizationSchema },
  prompt: `You are an expert at creating clear, concise summaries of legal and financial documents.

Document: {{fileName}}
Content: {{media url=fileContent}}

Context Information:
{{#entities}}
- Parties: {{#partyNames}}{{.}}, {{/partyNames}}
- Investment: {{investmentAmount}}
- Effective Date: {{effectiveDate}}
- Termination: {{terminationDate}}
- Deadlines: {{#keyDeadlines}}{{.}}, {{/keyDeadlines}}
{{/entities}}

{{#complianceIssues}}
Compliance Issues ({{complianceIssues.length}}):
{{#complianceIssues}}
- {{summary}} ({{severity}} - {{classification}})
{{/complianceIssues}}
{{/complianceIssues}}

Summary Type: {{summaryType}}
Max Length: {{maxLength}} words

Create a {{summaryType}} summary of this document. The summary should:

1. **Be concise**: Aim for approximately {{maxLength}} words total
2. **Highlight key elements**: Include main parties, purpose, key terms, and important dates
3. **Address compliance**: If compliance issues exist, mention critical findings
4. **Use professional language**: Appropriate for executive audiences
5. **Structure clearly**: Use bullet points for easy scanning

For {{summaryType}} summaries:
- **Executive**: High-level overview for business leaders
- **Technical**: Detailed technical specifications and requirements
- **Compliance**: Focus on regulatory compliance and risk assessment
- **Financial**: Emphasize financial terms, obligations, and implications

Include:
- 3-5 key bullet points that capture the document's essence
- 2-3 additional key points that highlight critical details
- Confidence score based on how well you understood the document
- Reasoning for your summary choices

Ensure the summary is accurate and based only on the provided document content.`,
});

// Summarization flow
const summarizationFlow = ai.defineFlow(
  {
    name: 'summarizationFlow',
    inputSchema: SummarizationInputSchema,
    outputSchema: SummarizationSchema,
  },
  async (input) => {
    const startTime = Date.now();

    try {
      const { output } = await summarizationPrompt(input);

      if (!output) {
        throw new Error('Summarization failed to produce output');
      }

      // Calculate word count
      const wordCount = output.summary.join(' ').split(' ').length;

      // Enhance with processing metadata
      const enhancedOutput = {
        ...output,
        processingTime: Date.now() - startTime,
        model: 'gemini-2.0-flash',
        wordCount,
        summarizedAt: new Date().toISOString(),
      };

      await logger.info('Document summarization completed', {
        documentId: input.documentId,
        summaryType: input.summaryType,
        wordCount,
        confidence: output.confidence,
        processingTime: enhancedOutput.processingTime,
      });

      return enhancedOutput;
    } catch (error) {
      await logger.error('Document summarization failed', error as Error, {
        documentId: input.documentId,
        summaryType: input.summaryType,
        processingTime: Date.now() - startTime,
      });

      throw error;
    }
  }
);

// Main summarization function
export async function summarizeDocument(input: SummarizationInput): Promise<Summarization> {
  return summarizationFlow(input);
}

// Batch summarization for multiple documents
export async function summarizeDocumentsBatch(
  documents: SummarizationInput[]
): Promise<Summarization[]> {
  const results: Summarization[] = [];

  for (const doc of documents) {
    try {
      const result = await summarizeDocument(doc);
      results.push(result);
    } catch (error) {
      await logger.error('Batch summarization failed for document', error as Error, {
        documentId: doc.documentId,
      });

      // Continue with other documents
    }
  }

  return results;
}

// Summary quality assessment
export function assessSummaryQuality(summarization: Summarization): {
  score: number;
  feedback: string[];
  improvements: string[];
} {
  const feedback: string[] = [];
  const improvements: string[] = [];

  // Check length appropriateness
  if (summarization.wordCount < 100) {
    feedback.push('Summary may be too brief');
    improvements.push('Consider adding more detail about key terms and obligations');
  } else if (summarization.wordCount > 800) {
    feedback.push('Summary may be too lengthy');
    improvements.push('Consider condensing while maintaining key information');
  } else {
    feedback.push('Summary length is appropriate');
  }

  // Check confidence level
  if (summarization.confidence < 70) {
    feedback.push('Low confidence in summary accuracy');
    improvements.push('Review document for clarity and completeness');
  } else if (summarization.confidence > 90) {
    feedback.push('High confidence in summary accuracy');
  }

  // Check structure
  if (summarization.summary.length < 3) {
    feedback.push('Summary structure could be improved');
    improvements.push('Add more bullet points to cover different aspects');
  } else if (summarization.summary.length > 8) {
    feedback.push('Summary may have too many points');
    improvements.push('Consolidate related points to improve readability');
  }

  // Calculate overall score
  let score = 100;
  score -= Math.max(0, 100 - summarization.confidence); // Confidence factor
  score -= summarization.wordCount < 100 ? 20 : summarization.wordCount > 800 ? 10 : 0; // Length factor
  score -= summarization.summary.length < 3 ? 15 : summarization.summary.length > 8 ? 10 : 0; // Structure factor

  return {
    score: Math.max(0, score),
    feedback,
    improvements,
  };
}

// Summary comparison utility
export function compareSummaries(
  summary1: Summarization,
  summary2: Summarization
): {
  similarity: number;
  differences: string[];
  betterSummary: 'summary1' | 'summary2' | 'tie';
} {
  const differences: string[] = [];

  // Compare confidence
  if (Math.abs(summary1.confidence - summary2.confidence) > 10) {
    differences.push(`Confidence difference: ${Math.abs(summary1.confidence - summary2.confidence)} points`);
  }

  // Compare length
  const lengthDiff = Math.abs(summary1.wordCount - summary2.wordCount);
  if (lengthDiff > 100) {
    differences.push(`Length difference: ${lengthDiff} words`);
  }

  // Compare structure
  if (summary1.summary.length !== summary2.summary.length) {
    differences.push(`Different number of summary points: ${summary1.summary.length} vs ${summary2.summary.length}`);
  }

  // Calculate similarity score
  let similarity = 100;
  similarity -= Math.min(30, Math.abs(summary1.confidence - summary2.confidence) * 2);
  similarity -= Math.min(20, lengthDiff / 10);
  similarity -= Math.abs(summary1.summary.length - summary2.summary.length) * 5;

  // Determine better summary
  let betterSummary: 'summary1' | 'summary2' | 'tie' = 'tie';
  if (summary1.confidence > summary2.confidence + 5 && summary1.wordCount > summary2.wordCount - 50) {
    betterSummary = 'summary1';
  } else if (summary2.confidence > summary1.confidence + 5 && summary2.wordCount > summary1.wordCount - 50) {
    betterSummary = 'summary2';
  }

  return {
    similarity: Math.max(0, similarity),
    differences,
    betterSummary,
  };
}
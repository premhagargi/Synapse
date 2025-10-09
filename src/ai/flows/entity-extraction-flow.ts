/**
 * @fileoverview Entity extraction flow for structured data extraction from documents
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { logger } from '@/shared/lib/logger';

// Entity extraction input schema
const EntityExtractionInputSchema = z.object({
  documentId: z.string().uuid(),
  fileName: z.string(),
  fileContent: z.string(),
  extractionTargets: z.array(z.enum([
    'party_names',
    'investment_amount',
    'effective_date',
    'termination_date',
    'key_deadlines',
    'compliance_obligations',
    'financial_terms',
    'governing_law',
    'signatories',
    'custom_fields'
  ])).default(['party_names', 'investment_amount', 'effective_date']),
});

// Entity extraction output schema
const EntityExtractionSchema = z.object({
  documentId: z.string().uuid(),
  extractedEntities: z.object({
    partyNames: z.array(z.string()).default([]),
    investmentAmount: z.string().optional(),
    effectiveDate: z.string().optional(),
    terminationDate: z.string().optional(),
    keyDeadlines: z.array(z.string()).default([]),
    complianceObligations: z.array(z.string()).default([]),
    financialTerms: z.array(z.string()).default([]),
    governingLaw: z.string().optional(),
    signatories: z.array(z.string()).default([]),
    customFields: z.record(z.any()).default({}),
  }),
  confidence: z.number().min(0).max(100),
  reasoning: z.array(z.string()),
  processingTime: z.number(),
});

export type EntityExtractionInput = z.infer<typeof EntityExtractionInputSchema>;
export type EntityExtraction = z.infer<typeof EntityExtractionSchema>;

// Entity extraction prompt
const entityExtractionPrompt = ai.definePrompt({
  name: 'entityExtractionPrompt',
  input: { schema: EntityExtractionInputSchema },
  output: { schema: EntityExtractionSchema },
  prompt: `You are an expert at extracting structured information from legal and financial documents.

Document: {{fileName}}
Content: {{media url=fileContent}}

Extraction Targets: {{extractionTargets}}

Please extract the following entities from the document:

1. **Party Names**: All individuals, companies, or entities mentioned as parties to the agreement
2. **Investment Amount**: Primary financial figures, investment amounts, or funding rounds
3. **Effective Date**: When the agreement becomes effective
4. **Termination Date**: When the agreement expires or can be terminated
5. **Key Deadlines**: Important dates, milestones, or deadlines
6. **Compliance Obligations**: Regulatory requirements, compliance standards, or legal obligations
7. **Financial Terms**: Payment terms, pricing, fees, or financial conditions
8. **Governing Law**: Jurisdiction or governing law for the agreement
9. **Signatories**: People or entities that need to sign the document

Instructions:
- Extract information exactly as it appears in the document
- Use standardized formats (YYYY-MM-DD for dates, $X,XXX,XXX for amounts)
- If information is not found, return empty arrays or null values
- Provide confidence scores based on clarity and directness of the information
- Include reasoning for each extraction decision

Return the extracted entities in the specified JSON format with confidence scores and reasoning.`,
});

// Entity extraction flow
const entityExtractionFlow = ai.defineFlow(
  {
    name: 'entityExtractionFlow',
    inputSchema: EntityExtractionInputSchema,
    outputSchema: EntityExtractionSchema,
  },
  async (input) => {
    const startTime = Date.now();

    try {
      const { output } = await entityExtractionPrompt(input);

      if (!output) {
        throw new Error('Entity extraction failed to produce output');
      }

      // Enhance with processing metadata
      const enhancedOutput = {
        ...output,
        processingTime: Date.now() - startTime,
        model: 'gemini-2.0-flash',
        extractedAt: new Date().toISOString(),
      };

      await logger.info('Entity extraction completed', {
        documentId: input.documentId,
        extractionTargets: input.extractionTargets.length,
        entitiesFound: Object.values(output.extractedEntities).flat().length,
        confidence: output.confidence,
        processingTime: enhancedOutput.processingTime,
      });

      return enhancedOutput;
    } catch (error) {
      await logger.error('Entity extraction failed', error as Error, {
        documentId: input.documentId,
        extractionTargets: input.extractionTargets,
        processingTime: Date.now() - startTime,
      });

      throw error;
    }
  }
);

// Main entity extraction function
export async function extractEntities(input: EntityExtractionInput): Promise<EntityExtraction> {
  return entityExtractionFlow(input);
}

// Batch entity extraction for multiple documents
export async function extractEntitiesBatch(
  documents: EntityExtractionInput[]
): Promise<EntityExtraction[]> {
  const results: EntityExtraction[] = [];

  for (const doc of documents) {
    try {
      const result = await extractEntities(doc);
      results.push(result);
    } catch (error) {
      await logger.error('Batch entity extraction failed for document', error as Error, {
        documentId: doc.documentId,
      });

      // Continue with other documents
    }
  }

  return results;
}
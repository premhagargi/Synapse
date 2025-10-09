/**
 * @fileoverview Compliance classification flow for identifying and categorizing compliance issues
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { logger } from '@/shared/lib/logger';

// Compliance classification input schema
const ComplianceClassificationInputSchema = z.object({
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
  standards: z.array(z.enum([
    'ISO_27001',
    'SOC_2',
    'SOX',
    'GDPR',
    'HIPAA',
    'PCI_DSS',
    'NIST',
    'SEC',
    'FINRA',
    'custom'
  ])).default(['SOC_2', 'GDPR']),
});

// Compliance issue schema
const ComplianceIssueSchema = z.object({
  id: z.string().uuid(),
  auditArea: z.string(),
  summary: z.string(),
  classification: z.enum(['compliance_issue', 'internal_process_issue']),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  reasoning: z.string(),
  recommendations: z.array(z.string()).optional(),
  references: z.array(z.object({
    standard: z.string(),
    section: z.string().optional(),
    requirement: z.string(),
  })).optional(),
  confidence: z.number().min(0).max(100),
});

// Compliance classification output schema
const ComplianceClassificationSchema = z.object({
  documentId: z.string().uuid(),
  complianceIssues: z.array(ComplianceIssueSchema),
  overallComplianceScore: z.number().min(0).max(100),
  standardsAssessed: z.array(z.string()),
  reasoning: z.array(z.string()),
  processingTime: z.number(),
});

export type ComplianceClassificationInput = z.infer<typeof ComplianceClassificationInputSchema>;
export type ComplianceIssue = z.infer<typeof ComplianceIssueSchema>;
export type ComplianceClassification = z.infer<typeof ComplianceClassificationSchema>;

// Compliance classification prompt
const complianceClassificationPrompt = ai.definePrompt({
  name: 'complianceClassificationPrompt',
  input: { schema: ComplianceClassificationInputSchema },
  output: { schema: ComplianceClassificationSchema },
  prompt: `You are a compliance expert analyzing documents for regulatory and internal compliance issues.

Document: {{fileName}}
Content: {{media url=fileContent}}

Context Entities:
{{#entities}}
- Parties: {{#partyNames}}{{.}}, {{/partyNames}}
- Investment: {{investmentAmount}}
- Effective Date: {{effectiveDate}}
- Termination: {{terminationDate}}
- Deadlines: {{#keyDeadlines}}{{.}}, {{/keyDeadlines}}
{{/entities}}

Standards to Assess: {{standards}}

Analyze this document for compliance issues across the specified standards. For each potential issue:

1. **Audit Area**: The specific area of compliance (e.g., 'Access Control', 'Data Protection', 'Financial Reporting')
2. **Summary**: Clear description of the finding
3. **Classification**: Either 'compliance_issue' (regulatory/legal violation) or 'internal_process_issue' (operational deviation)
4. **Severity**: low, medium, high, or critical based on potential impact
5. **Reasoning**: Detailed explanation of why this is classified as such
6. **Recommendations**: Specific actions to address the issue
7. **References**: Relevant standards, sections, or requirements
8. **Confidence**: How confident you are in this assessment (0-100)

Important Distinctions:
- Compliance Issue: Violates laws, regulations, or formal policies with potential legal/regulatory consequences
- Internal/Process Issue: Procedural, documentation, or operational gaps without direct regulatory impact
- Focus on actual document content, not external assumptions
- Consider the specific standards requested for assessment

Calculate an overall compliance score (0-100) based on:
- Number and severity of compliance issues
- Coverage of required elements for each standard
- Overall adherence to regulatory requirements

Return findings in JSON format with detailed reasoning for each classification.`,
});

// Compliance classification flow
const complianceClassificationFlow = ai.defineFlow(
  {
    name: 'complianceClassificationFlow',
    inputSchema: ComplianceClassificationInputSchema,
    outputSchema: ComplianceClassificationSchema,
  },
  async (input) => {
    const startTime = Date.now();

    try {
      const { output } = await complianceClassificationPrompt(input);

      if (!output) {
        throw new Error('Compliance classification failed to produce output');
      }

      // Enhance with processing metadata
      const enhancedOutput = {
        ...output,
        processingTime: Date.now() - startTime,
        model: 'gemini-2.0-flash',
        assessedAt: new Date().toISOString(),
      };

      await logger.info('Compliance classification completed', {
        documentId: input.documentId,
        standards: input.standards.length,
        issuesFound: output.complianceIssues.length,
        overallScore: output.overallComplianceScore,
        processingTime: enhancedOutput.processingTime,
      });

      return enhancedOutput;
    } catch (error) {
      await logger.error('Compliance classification failed', error as Error, {
        documentId: input.documentId,
        standards: input.standards,
        processingTime: Date.now() - startTime,
      });

      throw error;
    }
  }
);

// Main compliance classification function
export async function classifyCompliance(input: ComplianceClassificationInput): Promise<ComplianceClassification> {
  return complianceClassificationFlow(input);
}

// Batch compliance classification
export async function classifyComplianceBatch(
  documents: ComplianceClassificationInput[]
): Promise<ComplianceClassification[]> {
  const results: ComplianceClassification[] = [];

  for (const doc of documents) {
    try {
      const result = await classifyCompliance(doc);
      results.push(result);
    } catch (error) {
      await logger.error('Batch compliance classification failed for document', error as Error, {
        documentId: doc.documentId,
      });

      // Continue with other documents
    }
  }

  return results;
}

// Compliance scoring utilities
export function calculateComplianceScore(issues: ComplianceIssue[]): number {
  if (issues.length === 0) {
    return 100;
  }

  const totalWeight = issues.reduce((sum, issue) => {
    const weights = { low: 1, medium: 3, high: 7, critical: 10 };
    return sum + weights[issue.severity];
  }, 0);

  // Score calculation: 100 - (weighted issues / max possible weight) * 100
  const maxWeight = 10; // Maximum weight for one critical issue
  const score = 100 - (totalWeight / maxWeight) * 10;

  return Math.max(0, Math.min(100, score));
}

export function getComplianceTrend(
  previousScore: number,
  currentScore: number
): 'improving' | 'declining' | 'stable' {
  const difference = currentScore - previousScore;

  if (difference > 5) {
    return 'improving';
  } else if (difference < -5) {
    return 'declining';
  } else {
    return 'stable';
  }
}

// Compliance reporting utilities
export function generateComplianceReport(classification: ComplianceClassification): {
  summary: string;
  criticalIssues: ComplianceIssue[];
  recommendations: string[];
  nextSteps: string[];
} {
  const criticalIssues = classification.complianceIssues.filter(
    issue => issue.severity === 'critical' || issue.severity === 'high'
  );

  const recommendations = classification.complianceIssues
    .flatMap(issue => issue.recommendations || [])
    .filter((rec, index, arr) => arr.indexOf(rec) === index); // Remove duplicates

  const summary = `Compliance assessment completed with score of ${classification.overallComplianceScore}/100. ` +
    `Found ${classification.complianceIssues.length} issues across ${classification.standardsAssessed.length} standards. ` +
    `${criticalIssues.length} critical/high severity issues require immediate attention.`;

  const nextSteps = [
    'Review and address all critical and high-severity issues',
    'Implement recommended remediation actions',
    'Schedule follow-up assessment in 30 days',
    'Update compliance documentation',
  ];

  return {
    summary,
    criticalIssues,
    recommendations,
    nextSteps,
  };
}
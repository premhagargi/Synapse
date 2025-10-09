/**
 * @fileoverview Demo data service for Enterprise Mode showcase
 */

import { logger } from '@/shared/lib/logger';
import { Document, DocumentAnalysis, User, UserRole, SubscriptionTier } from '@/shared/types';

export interface DemoDocument extends Document {
  industry: string;
  documentType: string;
  tags: string[];
  isDemo: true;
}

export interface DemoAnalytics {
  totalDocuments: number;
  totalUsers: number;
  complianceScore: number;
  processingSpeed: number;
  industries: Array<{
    name: string;
    documentCount: number;
    complianceScore: number;
  }>;
  trends: Array<{
    date: string;
    documents: number;
    complianceScore: number;
  }>;
}

export class DemoDataService {
  private static instance: DemoDataService;

  static getInstance(): DemoDataService {
    if (!DemoDataService.instance) {
      DemoDataService.instance = new DemoDataService();
    }
    return DemoDataService.instance;
  }

  /**
   * Generate demo documents for showcase
   */
  async generateDemoDocuments(count: number = 20): Promise<DemoDocument[]> {
    try {
      const industries = [
        'Financial Services', 'Healthcare', 'Legal', 'Technology',
        'Manufacturing', 'Retail', 'Energy', 'Real Estate'
      ];

      const documentTypes = [
        'Investment Agreement', 'Compliance Report', 'Contract',
        'Financial Statement', 'Regulatory Filing', 'Due Diligence Report',
        'Partnership Agreement', 'Employment Contract'
      ];

      const demoDocuments: DemoDocument[] = [];

      for (let i = 0; i < count; i++) {
        const industry = industries[Math.floor(Math.random() * industries.length)];
        const documentType = documentTypes[Math.floor(Math.random() * documentTypes.length)];

        const demoDocument: DemoDocument = {
          id: `demo-doc-${i + 1}`,
          userId: 'demo-user',
          fileName: `Sample ${documentType} - ${industry} Company.pdf`,
          fileSize: Math.floor(Math.random() * 5000000) + 100000, // 100KB to 5MB
          fileType: 'pdf',
          mimeType: 'application/pdf',
          status: 'completed',
          analysis: this.generateDemoAnalysis(documentType, industry),
          version: 1,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000), // Last 30 days
          updatedAt: new Date(),
          industry,
          documentType,
          tags: this.generateDemoTags(industry, documentType),
          isDemo: true,
        };

        demoDocuments.push(demoDocument);
      }

      await logger.info('Demo documents generated', {
        count,
        industries: [...new Set(demoDocuments.map(d => d.industry))].length,
      });

      return demoDocuments;
    } catch (error) {
      await logger.error('Failed to generate demo documents', error as Error);
      throw error;
    }
  }

  /**
   * Generate demo analytics data
   */
  async generateDemoAnalytics(): Promise<DemoAnalytics> {
    try {
      const industries = [
        { name: 'Financial Services', baseScore: 85 },
        { name: 'Healthcare', baseScore: 92 },
        { name: 'Legal', baseScore: 88 },
        { name: 'Technology', baseScore: 90 },
        { name: 'Manufacturing', baseScore: 82 },
      ];

      const demoAnalytics: DemoAnalytics = {
        totalDocuments: 15420,
        totalUsers: 847,
        complianceScore: 87,
        processingSpeed: 12, // seconds
        industries: industries.map(industry => ({
          name: industry.name,
          documentCount: Math.floor(Math.random() * 5000) + 1000,
          complianceScore: industry.baseScore + Math.floor(Math.random() * 10) - 5,
        })),
        trends: Array.from({ length: 30 }, (_, i) => ({
          date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          documents: Math.floor(Math.random() * 200) + 300,
          complianceScore: Math.floor(Math.random() * 15) + 80,
        })),
      };

      await logger.info('Demo analytics generated', {
        totalDocuments: demoAnalytics.totalDocuments,
        totalUsers: demoAnalytics.totalUsers,
        complianceScore: demoAnalytics.complianceScore,
      });

      return demoAnalytics;
    } catch (error) {
      await logger.error('Failed to generate demo analytics', error as Error);
      throw error;
    }
  }

  /**
   * Generate demo users for enterprise showcase
   */
  async generateDemoUsers(count: number = 50): Promise<User[]> {
    try {
      const roles = [UserRole.ADMIN, UserRole.ANALYST, UserRole.VIEWER];
      const tiers = [SubscriptionTier.FREE, SubscriptionTier.PRO, SubscriptionTier.ENTERPRISE];
      const departments = ['Legal', 'Compliance', 'Finance', 'Operations', 'IT'];

      const demoUsers: User[] = [];

      for (let i = 0; i < count; i++) {
        const role = roles[Math.floor(Math.random() * roles.length)];
        const tier = tiers[Math.floor(Math.random() * tiers.length)];
        const department = departments[Math.floor(Math.random() * departments.length)];

        const demoUser: User = {
          uid: `demo-user-${i + 1}`,
          email: `user${i + 1}@demo-company.com`,
          displayName: `Demo User ${i + 1}`,
          role,
          subscription: {
            tier,
            status: 'active' as any,
            stripeCustomerId: `cus_demo_${i + 1}`,
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
          createdAt: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
          updatedAt: new Date(),
        };

        demoUsers.push(demoUser);
      }

      await logger.info('Demo users generated', {
        count,
        roles: [...new Set(demoUsers.map(u => u.role))],
        tiers: [...new Set(demoUsers.map(u => u.subscription.tier))],
      });

      return demoUsers;
    } catch (error) {
      await logger.error('Failed to generate demo users', error as Error);
      throw error;
    }
  }

  /**
   * Generate demo analysis for a document
   */
  private generateDemoAnalysis(documentType: string, industry: string): DocumentAnalysis {
    const summaries = [
      `Comprehensive ${documentType.toLowerCase()} analysis completed with high confidence in key findings.`,
      `Document review identified standard terms and conditions with no unusual clauses or red flags.`,
      `Analysis revealed compliance with industry standards and regulatory requirements.`,
      `Key financial terms and obligations clearly identified and categorized for review.`,
    ];

    const partyNames = [
      `${industry} Holdings LLC`,
      `Global Investment Partners`,
      `Regulatory Compliance Authority`,
      `Legal Advisors Group`,
    ];

    const complianceIssues = Math.random() > 0.7 ? [] : [
      {
        id: `issue-${Math.random().toString(36).substr(2, 9)}`,
        auditArea: 'Contract Terms',
        summary: 'Standard compliance clause identified',
        classification: 'internal_process_issue' as any,
        severity: 'low' as any,
        reasoning: 'Document contains standard compliance language appropriate for industry',
        confidence: 85,
      },
    ];

    return {
      id: `analysis-${Math.random().toString(36).substr(2, 9)}`,
      documentId: 'demo-doc',
      summary: [summaries[Math.floor(Math.random() * summaries.length)]],
      extractedData: {
        partyNames,
        investmentAmount: documentType.includes('Investment') ? '$2,500,000' : undefined,
        effectiveDate: '2024-01-15',
        terminationDate: '2025-01-15',
        keyDeadlines: ['2024-03-15', '2024-06-15', '2024-09-15'],
      },
      complianceIssues,
      confidence: Math.floor(Math.random() * 20) + 75,
      reasoning: [
        'Document structure analysis completed successfully',
        'Entity extraction validated against industry patterns',
        'Compliance classification based on regulatory standards',
      ],
      processingTime: Math.floor(Math.random() * 20) + 5,
      version: '2.0',
      createdAt: new Date(),
    };
  }

  /**
   * Generate demo tags for a document
   */
  private generateDemoTags(industry: string, documentType: string): string[] {
    const baseTags = ['demo', industry.toLowerCase(), documentType.toLowerCase().replace(' ', '-')];

    const additionalTags = [
      'urgent', 'review-required', 'high-value', 'confidential',
      'regulatory', 'financial', 'operational', 'strategic'
    ];

    // Add 1-3 random additional tags
    const numAdditionalTags = Math.floor(Math.random() * 3) + 1;
    for (let i = 0; i < numAdditionalTags; i++) {
      const randomTag = additionalTags[Math.floor(Math.random() * additionalTags.length)];
      if (!baseTags.includes(randomTag)) {
        baseTags.push(randomTag);
      }
    }

    return baseTags;
  }

  /**
   * Get demo dashboard data
   */
  async getDemoDashboardData() {
    try {
      const [documents, analytics, users] = await Promise.all([
        this.generateDemoDocuments(10),
        this.generateDemoAnalytics(),
        this.generateDemoUsers(25),
      ]);

      return {
        documents,
        analytics,
        users,
        summary: {
          totalDocuments: analytics.totalDocuments,
          totalUsers: analytics.totalUsers,
          averageComplianceScore: analytics.complianceScore,
          processingSpeed: analytics.processingSpeed,
          activeIndustries: analytics.industries.length,
          demoMode: true,
        },
      };
    } catch (error) {
      await logger.error('Failed to get demo dashboard data', error as Error);
      throw error;
    }
  }

  /**
   * Enable enterprise demo mode
   */
  async enableEnterpriseMode(): Promise<{
    enabled: boolean;
    features: string[];
    dataCount: number;
  }> {
    try {
      const demoData = await this.getDemoDashboardData();

      await logger.info('Enterprise demo mode enabled', {
        documents: demoData.documents.length,
        users: demoData.users.length,
        industries: demoData.analytics.industries.length,
      });

      return {
        enabled: true,
        features: [
          'Advanced Analytics Dashboard',
          'Multi-Industry Document Showcase',
          'Role-Based Access Examples',
          'Export Functionality Demo',
          'Real-Time Processing Simulation',
        ],
        dataCount: demoData.documents.length + demoData.users.length,
      };
    } catch (error) {
      await logger.error('Failed to enable enterprise mode', error as Error);
      throw error;
    }
  }
}

// Export singleton instance
export const demoDataService = DemoDataService.getInstance();

// Convenience functions
export async function getDemoDocuments(count?: number): Promise<DemoDocument[]> {
  return demoDataService.generateDemoDocuments(count);
}

export async function getDemoAnalytics(): Promise<DemoAnalytics> {
  return demoDataService.generateDemoAnalytics();
}

export async function getDemoUsers(count?: number): Promise<User[]> {
  return demoDataService.generateDemoUsers(count);
}

export async function enableDemoMode() {
  return demoDataService.enableEnterpriseMode();
}
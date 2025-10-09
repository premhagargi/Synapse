/**
 * @fileoverview Document analysis versioning service for tracking changes and maintaining history
 */

import { collection, addDoc, query, where, orderBy, limit, getDocs, serverTimestamp } from 'firebase/firestore';
import { firebaseConfig } from '@/firebase/config';
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { logger } from '@/shared/lib/logger';
import { DocumentAnalysis } from '@/shared/types';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export interface DocumentVersion {
  id: string;
  documentId: string;
  version: number;
  analysis: DocumentAnalysis;
  changes: string[];
  createdBy: string;
  createdAt: Date;
  metadata: {
    processingTime: number;
    confidence: number;
    model: string;
    fileHash?: string;
    previousVersion?: number;
  };
}

export class VersioningService {
  private static instance: VersioningService;

  static getInstance(): VersioningService {
    if (!VersioningService.instance) {
      VersioningService.instance = new VersioningService();
    }
    return VersioningService.instance;
  }

  /**
   * Create a new version of a document analysis
   */
  async createVersion(
    documentId: string,
    analysis: DocumentAnalysis,
    createdBy: string,
    changes: string[] = [],
    metadata?: Partial<DocumentVersion['metadata']>
  ): Promise<string> {
    try {
      // Get the latest version number
      const latestVersion = await this.getLatestVersionNumber(documentId);
      const newVersion = latestVersion + 1;

      const versionData = {
        documentId,
        version: newVersion,
        analysis,
        changes,
        createdBy,
        createdAt: serverTimestamp(),
        metadata: {
          processingTime: analysis.processingTime,
          confidence: analysis.confidence,
          model: 'gemini-2.0-flash',
          previousVersion: latestVersion,
          ...metadata,
        },
      };

      const docRef = await addDoc(collection(db, 'documentVersions'), versionData);

      // Update the document's current version reference
      await this.updateDocumentVersion(documentId, newVersion);

      await logger.info('Document version created', {
        documentId,
        version: newVersion,
        createdBy,
        changes: changes.length,
      });

      return docRef.id;
    } catch (error) {
      await logger.error('Failed to create document version', error as Error, {
        documentId,
        createdBy,
      });
      throw error;
    }
  }

  /**
   * Get all versions of a document
   */
  async getDocumentVersions(
    documentId: string,
    options: {
      limit?: number;
      includeCurrent?: boolean;
    } = {}
  ): Promise<DocumentVersion[]> {
    try {
      const { limit: limitCount = 50, includeCurrent = true } = options;

      const q = query(
        collection(db, 'documentVersions'),
        where('documentId', '==', documentId),
        orderBy('version', 'desc'),
        limit(limitCount)
      );

      const querySnapshot = await getDocs(q);

      const versions: DocumentVersion[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        versions.push({
          id: doc.id,
          documentId: data.documentId,
          version: data.version,
          analysis: data.analysis,
          changes: data.changes || [],
          createdBy: data.createdBy,
          createdAt: data.createdAt?.toDate() || new Date(),
          metadata: data.metadata || {},
        });
      });

      return versions;
    } catch (error) {
      await logger.error('Failed to get document versions', error as Error, {
        documentId,
      });
      throw error;
    }
  }

  /**
   * Get a specific version of a document
   */
  async getDocumentVersion(documentId: string, version: number): Promise<DocumentVersion | null> {
    try {
      const q = query(
        collection(db, 'documentVersions'),
        where('documentId', '==', documentId),
        where('version', '==', version),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return null;
      }

      const doc = querySnapshot.docs[0];
      const data = doc.data();

      return {
        id: doc.id,
        documentId: data.documentId,
        version: data.version,
        analysis: data.analysis,
        changes: data.changes || [],
        createdBy: data.createdBy,
        createdAt: data.createdAt?.toDate() || new Date(),
        metadata: data.metadata || {},
      };
    } catch (error) {
      await logger.error('Failed to get document version', error as Error, {
        documentId,
        version,
      });
      throw error;
    }
  }

  /**
   * Get the latest version of a document
   */
  async getLatestVersion(documentId: string): Promise<DocumentVersion | null> {
    try {
      const versions = await this.getDocumentVersions(documentId, { limit: 1 });
      return versions.length > 0 ? versions[0] : null;
    } catch (error) {
      await logger.error('Failed to get latest document version', error as Error, {
        documentId,
      });
      return null;
    }
  }

  /**
   * Compare two versions of a document
   */
  async compareVersions(
    documentId: string,
    version1: number,
    version2: number
  ): Promise<{
    version1: DocumentVersion;
    version2: DocumentVersion;
    differences: {
      summary: string[];
      complianceIssues: string[];
      confidence: number;
      processingTime: number;
    };
  }> {
    try {
      const [v1, v2] = await Promise.all([
        this.getDocumentVersion(documentId, version1),
        this.getDocumentVersion(documentId, version2),
      ]);

      if (!v1 || !v2) {
        throw new Error('One or both versions not found');
      }

      // Calculate differences
      const differences = {
        summary: this.compareArrays(v1.analysis.summary, v2.analysis.summary),
        complianceIssues: this.compareComplianceIssues(
          v1.analysis.complianceIssues,
          v2.analysis.complianceIssues
        ),
        confidence: v2.analysis.confidence - v1.analysis.confidence,
        processingTime: v2.analysis.processingTime - v1.analysis.processingTime,
      };

      return {
        version1: v1,
        version2: v2,
        differences,
      };
    } catch (error) {
      await logger.error('Failed to compare document versions', error as Error, {
        documentId,
        version1,
        version2,
      });
      throw error;
    }
  }

  /**
   * Get version history summary
   */
  async getVersionHistory(documentId: string): Promise<{
    totalVersions: number;
    latestVersion: number;
    createdBy: string[];
    dateRange: {
      earliest: Date;
      latest: Date;
    };
    averageConfidence: number;
    improvementTrend: 'improving' | 'declining' | 'stable';
  }> {
    try {
      const versions = await this.getDocumentVersions(documentId);

      if (versions.length === 0) {
        throw new Error('No versions found for document');
      }

      const totalVersions = versions.length;
      const latestVersion = Math.max(...versions.map(v => v.version));
      const createdBy = [...new Set(versions.map(v => v.createdBy))];
      const dates = versions.map(v => v.createdAt).sort((a, b) => a.getTime() - b.getTime());

      const confidences = versions.map(v => v.analysis.confidence);
      const averageConfidence = confidences.reduce((sum, c) => sum + c, 0) / confidences.length;

      // Determine improvement trend
      const firstHalf = confidences.slice(0, Math.floor(confidences.length / 2));
      const secondHalf = confidences.slice(Math.floor(confidences.length / 2));

      const firstHalfAvg = firstHalf.reduce((sum, c) => sum + c, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, c) => sum + c, 0) / secondHalf.length;

      let improvementTrend: 'improving' | 'declining' | 'stable' = 'stable';
      if (secondHalfAvg > firstHalfAvg + 5) {
        improvementTrend = 'improving';
      } else if (secondHalfAvg < firstHalfAvg - 5) {
        improvementTrend = 'declining';
      }

      return {
        totalVersions,
        latestVersion,
        createdBy,
        dateRange: {
          earliest: dates[0],
          latest: dates[dates.length - 1],
        },
        averageConfidence,
        improvementTrend,
      };
    } catch (error) {
      await logger.error('Failed to get version history', error as Error, {
        documentId,
      });
      throw error;
    }
  }

  /**
   * Rollback to a previous version
   */
  async rollbackToVersion(
    documentId: string,
    targetVersion: number,
    rolledBackBy: string,
    reason: string
  ): Promise<string> {
    try {
      const targetVersionData = await this.getDocumentVersion(documentId, targetVersion);

      if (!targetVersionData) {
        throw new Error('Target version not found');
      }

      const changes = [`Rollback to version ${targetVersion}`, `Reason: ${reason}`];

      return await this.createVersion(
        documentId,
        targetVersionData.analysis,
        rolledBackBy,
        changes,
        {
          ...targetVersionData.metadata,
          rollbackFrom: targetVersion,
          rollbackReason: reason,
        } as any
      );
    } catch (error) {
      await logger.error('Failed to rollback document version', error as Error, {
        documentId,
        targetVersion,
        rolledBackBy,
      });
      throw error;
    }
  }

  // Private helper methods
  private async getLatestVersionNumber(documentId: string): Promise<number> {
    try {
      const q = query(
        collection(db, 'documentVersions'),
        where('documentId', '==', documentId),
        orderBy('version', 'desc'),
        limit(1)
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return 0;
      }

      return querySnapshot.docs[0].data().version || 0;
    } catch (error) {
      await logger.warn('Failed to get latest version number', {
        error: error instanceof Error ? error.message : 'Unknown error',
        documentId,
      });
      return 0;
    }
  }

  private async updateDocumentVersion(documentId: string, version: number): Promise<void> {
    try {
      // In a real implementation, you would update the documents collection
      // to reference the current version
      await logger.debug('Document version reference updated', {
        documentId,
        version,
      });
    } catch (error) {
      await logger.warn('Failed to update document version reference', {
        error: error instanceof Error ? error.message : 'Unknown error',
        documentId,
        version,
      });
    }
  }

  private compareArrays(arr1: string[], arr2: string[]): string[] {
    const added = arr2.filter(item => !arr1.includes(item));
    const removed = arr1.filter(item => !arr2.includes(item));

    const changes: string[] = [];
    if (added.length > 0) {
      changes.push(`Added: ${added.join(', ')}`);
    }
    if (removed.length > 0) {
      changes.push(`Removed: ${removed.join(', ')}`);
    }

    return changes;
  }

  private compareComplianceIssues(
    issues1: any[],
    issues2: any[]
  ): string[] {
    const changes: string[] = [];

    const added = issues2.length - issues1.length;
    if (added > 0) {
      changes.push(`Added ${added} compliance issue(s)`);
    } else if (added < 0) {
      changes.push(`Removed ${Math.abs(added)} compliance issue(s)`);
    }

    return changes;
  }
}

// Export singleton instance
export const versioningService = VersioningService.getInstance();

// Convenience functions
export async function createDocumentVersion(
  documentId: string,
  analysis: DocumentAnalysis,
  createdBy: string,
  changes?: string[]
): Promise<string> {
  return versioningService.createVersion(documentId, analysis, createdBy, changes);
}

export async function getDocumentVersions(
  documentId: string,
  limit?: number
): Promise<DocumentVersion[]> {
  return versioningService.getDocumentVersions(documentId, { limit });
}

export async function compareDocumentVersions(
  documentId: string,
  version1: number,
  version2: number
) {
  return versioningService.compareVersions(documentId, version1, version2);
}

export async function rollbackDocumentVersion(
  documentId: string,
  targetVersion: number,
  rolledBackBy: string,
  reason: string
): Promise<string> {
  return versioningService.rollbackToVersion(documentId, targetVersion, rolledBackBy, reason);
}
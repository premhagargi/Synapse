'use client';

import { useState, useEffect } from 'react';
import { useFirestore } from '@/firebase';
import { getFileContentFromChunks } from '@/lib/file-utils';

/**
 * Custom hook for retrieving file content from chunks
 */
export function useChunkedFile(documentId: string, chunkCount: number) {
  const [fileContent, setFileContent] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const db = useFirestore();

  useEffect(() => {
    if (!documentId || chunkCount === 0) {
      setFileContent('');
      return;
    }

    const fetchFileContent = async () => {
      setLoading(true);
      setError(null);
      
      try {
        const content = await getFileContentFromChunks(documentId, chunkCount, db);
        setFileContent(content);
      } catch (err: any) {
        console.error('Failed to fetch file content from chunks:', err);
        setError(err.message || 'Failed to load file content');
      } finally {
        setLoading(false);
      }
    };

    fetchFileContent();
  }, [documentId, chunkCount, db]);

  return { fileContent, loading, error };
}

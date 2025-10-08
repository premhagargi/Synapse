/**
 * Utility functions for handling large files with Firestore size limits
 */

const MAX_CHUNK_SIZE = 800000; // 800KB chunks (leaving room for metadata)
const CHUNK_METADATA_SIZE = 10000; // Reserve 10KB for chunk metadata

/**
 * Split a base64 string into chunks that fit within Firestore limits
 */
export function chunkBase64(base64String: string, maxChunkSize: number = MAX_CHUNK_SIZE): string[] {
  const chunks: string[] = [];
  let start = 0;
  
  while (start < base64String.length) {
    const end = Math.min(start + maxChunkSize, base64String.length);
    chunks.push(base64String.slice(start, end));
    start = end;
  }
  
  return chunks;
}

/**
 * Reconstruct base64 string from chunks
 */
export function reconstructBase64(chunks: string[]): string {
  return chunks.join('');
}

/**
 * Calculate the number of chunks needed for a given file size
 */
export function calculateChunkCount(fileSize: number): number {
  // Estimate base64 size (original * 4/3 + padding)
  const estimatedBase64Size = Math.ceil(fileSize * 1.34);
  return Math.ceil(estimatedBase64Size / MAX_CHUNK_SIZE);
}

/**
 * Compress file content using built-in browser compression
 */
export async function compressFile(file: File, quality: number = 0.8): Promise<File> {
  // For images, we can use canvas compression
  if (file.type.startsWith('image/')) {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: file.type }));
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };
      
      img.onerror = reject;
      img.src = URL.createObjectURL(file);
    });
  }
  
  // For other files, return as-is (could implement other compression methods)
  return file;
}

/**
 * Get file size in human-readable format
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Firestore chunk data interface
 */
export interface DocumentChunk {
  id: string;
  documentId: string;
  chunkIndex: number;
  totalChunks: number;
  content: string;
  userId: string;
  createdAt: any;
}

/**
 * Reconstruct file content from chunks
 */
export async function getFileContentFromChunks(
  documentId: string,
  chunkCount: number,
  db: any
): Promise<string> {
  if (chunkCount === 0) {
    return '';
  }

  const chunks: DocumentChunk[] = [];
  
  // Fetch all chunks for the document
  for (let i = 0; i < chunkCount; i++) {
    const { query, collection, where, orderBy, getDocs } = await import('firebase/firestore');
    const chunksQuery = query(
      collection(db, 'documentChunks'),
      where('documentId', '==', documentId),
      where('chunkIndex', '==', i),
      orderBy('chunkIndex')
    );
    
    const snapshot = await getDocs(chunksQuery);
    if (!snapshot.empty) {
      const chunkData = snapshot.docs[0].data() as DocumentChunk;
      chunkData.id = snapshot.docs[0].id;
      chunks.push(chunkData);
    }
  }

  // Sort chunks by index and reconstruct
  chunks.sort((a, b) => a.chunkIndex - b.chunkIndex);
  const contentArray = chunks.map(chunk => chunk.content);
  
  return reconstructBase64(contentArray);
}

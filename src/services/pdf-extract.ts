// src/services/pdf-extract.ts
import pdf from 'pdf-parse';

/**
 * Extracts text content from a PDF provided as a data URI.
 * @param dataUri The PDF file encoded as a data URI.
 * @returns A promise that resolves to the extracted text content.
 */
export async function pdfExtract(dataUri: string): Promise<string> {
  if (!dataUri.startsWith('data:application/pdf;base64,')) {
    throw new Error('Invalid data URI format for PDF.');
  }
  
  const base64Data = dataUri.replace('data:application/pdf;base64,', '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  const data = await pdf(buffer);
  return data.text;
}

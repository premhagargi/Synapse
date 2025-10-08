'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore } from '@/firebase';
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
// Removed Firebase Storage imports - using chunking instead
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { BackButton } from '@/components/BackButton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { analyzeDocument } from '@/ai/flows/analyze-document';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { chunkBase64, compressFile, formatFileSize, calculateChunkCount } from '@/lib/file-utils';
import Link from 'next/link';

export default function UploadDocumentPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    setIsUploading(true);
    toast({ title: 'Starting analysis...', description: 'Your document is being uploaded and analyzed. This may take a moment.' });

    // Double-check authentication state before proceeding
    if (!user.uid) {
      toast({
        variant: 'destructive',
        title: 'Authentication Error',
        description: 'Please log in again to upload documents.',
      });
      setIsUploading(false);
      return;
    }

    try {
      // Check file size and warn if too large
      const estimatedChunks = calculateChunkCount(selectedFile.size);
      if (estimatedChunks > 50) { // More than ~40MB file
        toast({
          variant: 'destructive',
          title: 'File Too Large',
          description: `This file is very large (${formatFileSize(selectedFile.size)}). Consider using a smaller file or compressing it.`,
        });
        setIsUploading(false);
        return;
      }

      toast({
        title: 'Processing file...',
        description: `Preparing ${selectedFile.name} for analysis.`,
      });

      // Try to compress the file first (for images)
      let processedFile = selectedFile;
      if (selectedFile.type.startsWith('image/')) {
        try {
          processedFile = await compressFile(selectedFile, 0.8);
          toast({
            title: 'File compressed',
            description: `Reduced from ${formatFileSize(selectedFile.size)} to ${formatFileSize(processedFile.size)}`,
          });
        } catch (error) {
          console.log('Compression failed, using original file:', error);
        }
      }

      // Read file content for analysis
      const reader = new FileReader();
      const fileContentPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(processedFile);
      });
      
      const fileContent = await fileContentPromise;
      
      toast({
        title: 'Analyzing document...',
        description: 'AI is analyzing your document content.',
      });

      const analysisResult = await analyzeDocument({
        fileContent,
        fileName: selectedFile.name,
      });
      
      // Create main document
      const newDocRef = doc(collection(db, 'documents'));
      const documentId = newDocRef.id;
      
      // Store file content in chunks if needed
      let fileContentChunks: string[] = [];
      let chunkCount = 0;
      
      if (fileContent.length > 800000) { // If larger than 800KB
        toast({
          title: 'Storing large file...',
          description: 'Splitting file into chunks for storage.',
        });
        
        fileContentChunks = chunkBase64(fileContent);
        chunkCount = fileContentChunks.length;
        
        // Store each chunk as a separate document
        for (let i = 0; i < fileContentChunks.length; i++) {
          const chunkRef = doc(collection(db, 'documentChunks'));
          await setDoc(chunkRef, {
            documentId,
            chunkIndex: i,
            totalChunks: fileContentChunks.length,
            content: fileContentChunks[i],
            userId: user.uid,
            createdAt: serverTimestamp(),
          });
        }
      }
      
      // Create main document
      const newDocData = {
        userId: user.uid,
        fileName: selectedFile.name,
        fileSize: processedFile.size,
        fileType: selectedFile.type,
        chunkCount: chunkCount,
        createdAt: serverTimestamp(),
        analysis: analysisResult,
        // Only store content directly if it's small enough
        fileContent: fileContent.length <= 800000 ? fileContent : undefined,
      };

      // Add a small delay to ensure authentication state is fully synchronized
      await new Promise(resolve => setTimeout(resolve, 100));

      await setDoc(newDocRef, newDocData);
      
      toast({
        title: 'Analysis Complete!',
        description: `${selectedFile.name} has been processed and saved.`,
      });
      
      router.push(`/documents/${newDocRef.id}`);

    } catch (error: any) {
      console.error('Upload or analysis failed:', error);
      
      if (error.code === 'permission-denied') {
        const permissionError = new FirestorePermissionError({
          path: 'documents',
          operation: 'create',
          requestResourceData: { fileName: selectedFile.name },
        });
        errorEmitter.emit('permission-error', permissionError);
      } else {
        toast({
          variant: 'destructive',
          title: 'Upload Failed',
          description: `Failed to upload document: ${error.message || 'Unknown error'}`,
        });
      }
      setIsUploading(false);
    }
  };

  if (userLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50/50">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
          <BackButton href="/documents">Back to Documents</BackButton>
          <Card>
            <CardHeader>
                <CardTitle>Upload New Document</CardTitle>
                <CardDescription>
                    Upload a PDF or Word document for AI-powered analysis.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Input
                    type="file"
                    onChange={handleFileChange}
                    accept=".pdf,.doc,.docx"
                    disabled={isUploading}
                    className="h-auto p-4"
                />
                <div className="flex gap-4">
                    <Button
                        onClick={handleUpload}
                        disabled={!selectedFile || isUploading}
                        className="w-full"
                    >
                        {isUploading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                        <Upload className="mr-2 h-4 w-4" />
                        )}
                        {isUploading ? 'Analyzing...' : 'Upload & Analyze'}
                    </Button>
                </div>
            </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}

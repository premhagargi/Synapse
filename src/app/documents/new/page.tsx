'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useStorage } from '@/firebase';
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import { Header } from '@/components/Header';
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
import Link from 'next/link';

export default function UploadDocumentPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const storage = useStorage();
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
      // First, upload the file to Firebase Storage
      const fileRef = ref(storage, `documents/${user.uid}/${Date.now()}-${selectedFile.name}`);
      
      toast({
        title: 'Uploading file...',
        description: 'Uploading your document to secure storage.',
      });
      
      const uploadSnapshot = await uploadBytes(fileRef, selectedFile);
      const downloadURL = await getDownloadURL(uploadSnapshot.ref);
      
      // Read file content for analysis (keep as base64 for now, but this could be optimized)
      const reader = new FileReader();
      const fileContentPromise = new Promise<string>((resolve, reject) => {
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(selectedFile);
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
      
      // Create Firestore document with file reference instead of content
      const newDocRef = doc(collection(db, 'documents'));
      const newDocData = {
        userId: user.uid,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        fileType: selectedFile.type,
        fileUrl: downloadURL, // Reference to file in Storage
        storagePath: fileRef.fullPath, // Storage path for reference
        createdAt: serverTimestamp(),
        analysis: analysisResult,
        // Note: fileContent removed to avoid size limit issues
        // File content is now stored in Firebase Storage
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
      } else if (error.code === 'storage/unauthorized') {
        toast({
          variant: 'destructive',
          title: 'Storage Permission Denied',
          description: 'You do not have permission to upload files.',
        });
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
    <div className="flex h-screen flex-col bg-gray-50/50">
      <Header />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-2xl">
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
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/documents">Cancel</Link>
                    </Button>
                </div>
            </CardContent>
        </Card>
        </div>
      </main>
    </div>
  );
}

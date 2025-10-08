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

    const reader = new FileReader();
    reader.readAsDataURL(selectedFile);
    reader.onload = async () => {
      try {
        const fileContent = reader.result as string;

        const analysisResult = await analyzeDocument({
          fileContent,
          fileName: selectedFile.name,
        });
        
        const newDocRef = doc(collection(db, 'documents'));
        const newDocData = {
          userId: user.uid,
          fileName: selectedFile.name,
          createdAt: serverTimestamp(),
          analysis: analysisResult,
          fileContent: fileContent, // Storing for chat, could be moved to Storage
        };

        setDoc(newDocRef, newDocData)
          .then(() => {
            toast({
              title: 'Analysis Complete!',
              description: `${selectedFile.name} has been processed.`,
            });
            router.push(`/documents/${newDocRef.id}`);
          })
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: newDocRef.path,
              operation: 'create',
              requestResourceData: newDocData,
            });
            errorEmitter.emit('permission-error', permissionError);
            setIsUploading(false);
          });

      } catch (error) {
        console.error('Analysis failed:', error);
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'Could not analyze the document. Please try again.',
        });
        setIsUploading(false);
      }
    };
    reader.onerror = (error) => {
      console.error('File reading error:', error);
      toast({
        variant: 'destructive',
        title: 'File Error',
        description: 'Could not read the selected file.',
      });
      setIsUploading(false);
    };
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

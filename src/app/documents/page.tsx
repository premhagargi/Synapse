'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollectionQuery } from '@/firebase/firestore/use-collection-query';
import type { DocumentAnalysis } from '@/ai/schemas';
import { Loader2, FileText, PlusCircle } from 'lucide-react';

interface DocumentData {
  id: string;
  userId: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  fileUrl?: string;
  storagePath?: string;
  createdAt: {
    seconds: number;
    nanoseconds: number;
  };
  analysis?: DocumentAnalysis;
}

function DocumentCard({ doc }: { doc: DocumentData }) {
    const snippet = doc.analysis?.summary.split('\n')[0] || "No summary available.";
    const uploadDate = doc.createdAt ? format(new Date(doc.createdAt.seconds * 1000), 'PPP') : 'N/A';
  
    return (
      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="truncate text-lg">{doc.fileName}</CardTitle>
          <CardDescription>Uploaded on {uploadDate}</CardDescription>
        </CardHeader>
        <CardContent className="flex-grow">
          <p className="text-sm text-muted-foreground line-clamp-3">{snippet}</p>
        </CardContent>
        <CardFooter>
          <Button asChild variant="secondary" className="w-full">
            <Link href={`/documents/${doc.id}`}>View Analysis</Link>
          </Button>
        </CardFooter>
      </Card>
    );
  }

export default function DocumentsPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();

  const documentsQuery = useMemo(() => {
    if (!user) return undefined;
    return query(collection(db, 'documents'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
  }, [db, user]);

  const { data: documents, loading: docsLoading } = useCollectionQuery<DocumentData>(documentsQuery);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);

  if (userLoading || docsLoading) {
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
        <div className="mx-auto max-w-7xl">
          <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-2xl font-semibold">Document History</h1>
                <p className="text-gray-600">Review your previously analyzed documents.</p>
            </div>
            <Button asChild>
                <Link href="/documents/new"><PlusCircle className="mr-2 h-4 w-4"/> Upload New</Link>
            </Button>
          </div>

          {documents && documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <DocumentCard key={doc.id} doc={doc} />
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full min-h-[50vh] border-2 border-dashed rounded-lg">
                <div className="text-center">
                    <FileText className="mx-auto h-12 w-12 text-gray-400" />
                    <h3 className="mt-2 text-lg font-medium text-gray-900">
                    No documents found
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                    Get started by uploading your first document.
                    </p>
                    <Button asChild className="mt-6">
                        <Link href="/documents/new">Upload Document</Link>
                    </Button>
                </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

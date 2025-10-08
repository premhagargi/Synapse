'use client';

import { useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useUser, useFirestore } from '@/firebase';
import { collection, query, where } from 'firebase/firestore';
import { DashboardSidebar } from '@/components/DashboardSidebar';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollectionQuery } from '@/firebase/firestore/use-collection-query';
import type { DocumentAnalysis } from '@/ai/schemas';
import { Loader2, FileWarning, Files, BarChart, Upload, FileText } from 'lucide-react';

interface DocumentData {
  id: string;
  userId: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  chunkCount?: number;
  createdAt: any;
  analysis?: DocumentAnalysis;
  fileContent?: string; // For small files
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();

  const documentsQuery = useMemo(() => {
    if (!user) return undefined;
    return query(collection(db, 'documents'), where('userId', '==', user.uid));
  }, [db, user]);

  const { data: documents } = useCollectionQuery<DocumentData>(documentsQuery);

  useEffect(() => {
    if (!userLoading && !user) {
      router.push('/login');
    }
  }, [user, userLoading, router]);
  
  if (userLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  
  const totalDocs = documents?.length || 0;
  const complianceIssuesCount = documents?.reduce((acc, doc) => acc + (doc.analysis?.complianceIssues?.filter(c => c.classification === 'Compliance Issue').length || 0), 0) || 0;


  return (
    <div className="flex h-screen bg-gray-50/50">
      <DashboardSidebar />
      <main className="flex-1 overflow-y-auto p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">Welcome back, {user.displayName || user.email}!</h1>
            <p className="text-gray-600">Here's a summary of your documents and compliance status.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Documents</CardTitle>
                <Files className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDocs}</div>
                <p className="text-xs text-muted-foreground">documents uploaded</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Compliance Issues</CardTitle>
                <FileWarning className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{complianceIssuesCount}</div>
                <p className="text-xs text-muted-foreground">issues flagged across all documents</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Processed</CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalDocs}</div>
                <p className="text-xs text-muted-foreground">documents analyzed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="flex flex-col items-center justify-center text-center p-8">
                <Upload className="h-12 w-12 text-gray-400 mb-4"/>
                <CardTitle className="mb-2">Upload a New Document</CardTitle>
                <CardDescription className="mb-4">Get instant analysis and insights.</CardDescription>
                <Button asChild>
                    <Link href="/documents/new">Upload Document</Link>
                </Button>
            </Card>
            <Card className="flex flex-col items-center justify-center text-center p-8">
                <FileText className="h-12 w-12 text-gray-400 mb-4"/>
                <CardTitle className="mb-2">View Document History</CardTitle>
                <CardDescription className="mb-4">Review your past analyses and findings.</CardDescription>
                <Button asChild>
                    <Link href="/documents">View History</Link>
                </Button>
            </Card>
          </div>

        </div>
      </main>
    </div>
  );
}

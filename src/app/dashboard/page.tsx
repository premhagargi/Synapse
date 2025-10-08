'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth } from '@/firebase';
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
  query,
  where,
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
import { useCollectionQuery } from '@/firebase/firestore/use-collection-query';
import { analyzeDocument } from '@/ai/flows/analyze-document';
import type { DocumentAnalysis } from '@/ai/schemas';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, FileText, Bot, User, BarChart, FileWarning, Files } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';
import { ScrollArea } from '@/components/ui/scroll-area';

interface DocumentData {
  id: string;
  userId: string;
  fileName: string;
  createdAt: any;
  analysis?: DocumentAnalysis;
  fileContent?: string;
}

export default function DashboardPage() {
  const { user, loading: userLoading } = useUser();
  const router = useRouter();
  const db = useFirestore();
  const { toast } = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocumentData | null>(null);
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', message: string}[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  const documentsQuery = useMemo(() => {
    if (!user) return undefined;
    return query(collection(db, 'documents'), where('userId', '==', user.uid));
  }, [db, user]);

  const { data: documents, loading: docsLoading } = useCollectionQuery<DocumentData>(documentsQuery);

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
    toast({ title: 'Starting analysis...', description: 'Your document is being uploaded and analyzed.' });

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
        const newDocData: Omit<DocumentData, 'id'> = {
          userId: user.uid,
          fileName: selectedFile.name,
          createdAt: serverTimestamp(),
          analysis: analysisResult,
          fileContent: fileContent,
        };

        setDoc(newDocRef, newDocData)
          .then(() => {
            toast({
              title: 'Analysis Complete!',
              description: `${selectedFile.name} has been processed.`,
            });
            // Select the new document automatically
            setSelectedDoc({ id: newDocRef.id, ...newDocData });
          })
          .catch((serverError) => {
            const permissionError = new FirestorePermissionError({
              path: newDocRef.path,
              operation: 'create',
              requestResourceData: newDocData,
            });
            errorEmitter.emit('permission-error', permissionError);
          });

      } catch (error) {
        console.error('Analysis failed:', error);
        toast({
          variant: 'destructive',
          title: 'Analysis Failed',
          description: 'Could not analyze the document. Please try again.',
        });
      } finally {
        setIsUploading(false);
        setSelectedFile(null);
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
  
  const handleSelectDoc = (doc: DocumentData) => {
    setSelectedDoc(doc);
    setChatHistory([]);
    setChatMessage('');
  }

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage || !selectedDoc || isChatting) return;

    const newHistory = [...chatHistory, { role: 'user' as const, message: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');
    setIsChatting(true);

    try {
      setTimeout(() => {
        const botResponse = "I'm still learning to answer questions. This feature is coming soon!";
        setChatHistory([...newHistory, { role: 'model' as const, message: botResponse }]);
        setIsChatting(false);
      }, 1500);

    } catch (error) {
       toast({
          variant: 'destructive',
          title: 'Chat Error',
          description: 'Could not get an answer. Please try again.',
        });
       setIsChatting(false);
    }
  }

  const totalDocs = documents?.length || 0;
  const complianceIssuesCount = documents?.reduce((acc, doc) => acc + (doc.analysis?.complianceIssues?.length || 0), 0) || 0;


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
      <main className="flex-1 overflow-y-auto">
        <ScrollArea className="h-full">
            <div className="mx-auto max-w-7xl p-4 md:p-8">
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

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column */}
                    <div className="lg:col-span-1 space-y-8">
                        <Card>
                            <CardHeader>
                                <CardTitle>Upload New Document</CardTitle>
                                <CardDescription>
                                    Upload a PDF or Word doc for analysis.
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                            <Input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx"
                                disabled={isUploading}
                            />
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
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                            <CardTitle>Document History</CardTitle>
                            </CardHeader>
                            <CardContent className="max-h-[300px] overflow-y-auto">
                            {docsLoading ? (
                                <div className="space-y-2">
                                    <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
                                    <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
                                </div>
                            ) : documents && documents.length > 0 ? (
                                <ul className="space-y-2">
                                {documents?.map((doc) => (
                                    <li key={doc.id}>
                                    <button
                                        onClick={() => handleSelectDoc(doc)}
                                        className={`w-full text-left p-2 rounded-md flex items-center gap-2 ${selectedDoc?.id === doc.id ? 'bg-black/10' : 'hover:bg-black/5'}`}
                                    >
                                        <FileText className="h-4 w-4 shrink-0"/>
                                        <span className="truncate">{doc.fileName}</span>
                                    </button>
                                    </li>
                                ))}
                                </ul>
                            ) : (
                                <p className="text-sm text-gray-500 text-center py-4">No documents uploaded yet.</p>
                            )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column */}
                    <div className="lg:col-span-2">
                    {selectedDoc ? (
                        <div className="space-y-8">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Analysis for: {selectedDoc.fileName}</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    {selectedDoc.analysis ? (
                                        <>
                                            <div>
                                                <h3 className="font-bold text-lg mb-2">Summary</h3>
                                                <div className="text-gray-700 whitespace-pre-wrap p-4 bg-gray-100/50 rounded-md">{selectedDoc.analysis.summary}</div>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-2">Extracted Data</h3>
                                                <pre className="p-4 bg-gray-100 rounded-md text-sm overflow-x-auto">
                                                    {JSON.stringify(selectedDoc.analysis.extractedData, null, 2)}
                                                </pre>
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-lg mb-2">Compliance Issues</h3>
                                                {selectedDoc.analysis.complianceIssues.length > 0 ? (
                                                    <ul className="list-disc list-inside space-y-1 text-red-600 bg-red-50 p-4 rounded-md">
                                                        {selectedDoc.analysis.complianceIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                                                    </ul>
                                                ) : <p className="text-green-600 p-4 bg-green-50 rounded-md">No compliance issues found.</p>}
                                            </div>
                                        </>
                                    ) : (
                                        <p>No analysis available for this document.</p>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Ask a Question</CardTitle>
                                    <CardDescription>Ask the AI about this document in plain English.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-64 overflow-y-auto space-y-4 p-4 border rounded-md mb-4 bg-white">
                                        {chatHistory.length === 0 && (
                                            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
                                                <Bot className="h-8 w-8 mb-2"/>
                                                <p>Chat history will appear here.</p>
                                            </div>
                                        )}
                                        {chatHistory.map((chat, i) => (
                                            <div key={i} className={`flex gap-2 items-start ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                                {chat.role === 'model' && <Bot className="h-6 w-6 shrink-0"/>}
                                                <div className={`max-w-[80%] p-3 rounded-lg ${chat.role === 'user' ? 'bg-black text-white' : 'bg-gray-200'}`}>
                                                    <p className="text-sm">{chat.message}</p>
                                                </div>
                                                {chat.role === 'user' && <User className="h-6 w-6 shrink-0"/>}
                                            </div>
                                        ))}
                                        {isChatting && (
                                            <div className="flex gap-2 items-start justify-start">
                                                <Bot className="h-6 w-6 shrink-0"/>
                                                <div className="p-3 rounded-lg bg-gray-200">
                                                    <Loader2 className="h-5 w-5 animate-spin"/>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    <form onSubmit={handleChatSubmit} className="flex gap-2">
                                        <Input 
                                            value={chatMessage}
                                            onChange={(e) => setChatMessage(e.target.value)}
                                            placeholder="E.g., What is the termination date?"
                                            disabled={isChatting}
                                        />
                                        <Button type="submit" disabled={isChatting || !chatMessage}>Send</Button>
                                    </form>
                                </CardContent>
                            </Card>
                        </div>
                    ) : (
                        <Card className="flex items-center justify-center h-full min-h-[60vh]">
                        <CardContent className="text-center">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-2 text-lg font-medium text-gray-900">
                            No document selected
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">
                            Upload a new document or select one from your history to begin.
                            </p>
                        </CardContent>
                        </Card>
                    )}
                    </div>
                </div>
            </div>
        </ScrollArea>
      </main>
    </div>
  );
}

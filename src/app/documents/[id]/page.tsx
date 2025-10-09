'use client';

import { useEffect, useState } from 'react';
import { useUser, useFirestore } from '@/firebase';
import { doc } from 'firebase/firestore';
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
import { useDoc } from '@/firebase/firestore/use-doc';
import type { DocumentAnalysis } from '@/ai/schemas';
import { useToast } from '@/hooks/use-toast';
import { useChunkedFile } from '@/hooks/use-chunked-file';
import { Loader2, Bot, User, FileWarning } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

interface DocumentData {
  id: string;
  userId: string;
  fileName: string;
  fileSize?: number;
  fileType?: string;
  chunkCount?: number;
  createdAt: any;
  analysis?: DocumentAnalysis;
  fileContent?: string; // For small files or backward compatibility
}

export default function AnalysisPage({ params }: { params: { id: string } }) {
  const { user } = useUser();
  const { toast } = useToast();

  const docPath = params.id ? `documents/${params.id}` : '';
  const { data: selectedDoc, loading: docLoading } = useDoc<DocumentData>(docPath);

  // Handle chunked files
  const { fileContent: chunkedFileContent, loading: chunkLoading, error: chunkError } = useChunkedFile(
    params.id,
    selectedDoc?.chunkCount || 0
  );

  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'model', message: string}[]>([]);
  const [chatMessage, setChatMessage] = useState('');
  const [isChatting, setIsChatting] = useState(false);

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage || !selectedDoc || isChatting) return;

    const newHistory = [...chatHistory, { role: 'user' as const, message: chatMessage }];
    setChatHistory(newHistory);
    setChatMessage('');
    setIsChatting(true);

    try {
      // Placeholder for actual chat flow
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

  // Get the correct file content (from chunks or direct storage)
  const getFileContent = () => {
    if (selectedDoc?.chunkCount && selectedDoc.chunkCount > 0) {
      return chunkedFileContent;
    }
    return selectedDoc?.fileContent || '';
  };

  // Security check: ensure the user viewing the doc is the one who owns it.
  useEffect(() => {
    if (!userLoading && !docLoading && selectedDoc && user && selectedDoc.userId !== user.uid) {
        toast({
            variant: 'destructive',
            title: 'Access Denied',
            description: "You don't have permission to view this document.",
        });
    }
  }, [user, selectedDoc, userLoading, docLoading, toast]);

  // Show chunk loading error
  useEffect(() => {
    if (chunkError) {
      toast({
        variant: 'destructive',
        title: 'File Loading Error',
        description: 'Could not load file content. Please try refreshing the page.',
      });
    }
  }, [chunkError, toast]);


  if (docLoading || !selectedDoc || (selectedDoc.chunkCount && selectedDoc.chunkCount > 0 && chunkLoading)) {
    return (
      <div className="p-4 md:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <div className="h-10 bg-gray-200 rounded animate-pulse w-24 mb-4"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-64"></div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-20"></div>
                    <div className="h-24 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
                    <div className="h-32 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-4 w-48"></div>
                    <div className="space-y-4">
                      {[1, 2, 3].map((i) => (
                        <div key={i} className="p-4 rounded-md border bg-white">
                          <div className="flex items-center justify-between mb-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
                            <div className="h-6 bg-gray-200 rounded animate-pulse w-20"></div>
                          </div>
                          <div className="space-y-2 mb-2">
                            <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                          </div>
                          <div className="border-t pt-2 mt-2">
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-16 mb-1"></div>
                            <div className="h-3 bg-gray-200 rounded animate-pulse w-full"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded animate-pulse mb-2 w-32"></div>
                  <div className="h-4 bg-gray-200 rounded animate-pulse w-48"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-80 bg-gray-200 rounded animate-pulse mb-4"></div>
                  <div className="flex gap-2">
                    <div className="h-10 bg-gray-200 rounded animate-pulse flex-1"></div>
                    <div className="h-10 bg-gray-200 rounded animate-pulse w-20"></div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (selectedDoc.userId !== user?.uid) {
    return (
        <div className="p-4 md:p-8 text-center">
            <div>
                <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
                <p className="text-gray-600">You are not authorized to view this document.</p>
                <Button asChild className="mt-4">
                    <Link href="/documents">Go to Documents</Link>
                </Button>
            </div>
        </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mx-auto max-w-7xl">
        <BackButton href="/documents">Back to Documents</BackButton>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
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
                                    <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                                        <FileWarning className="h-5 w-5"/>
                                        Compliance & Process Review
                                    </h3>
                                    {selectedDoc.analysis.complianceIssues.length > 0 ? (
                                      <div className="space-y-4">
                                        {selectedDoc.analysis.complianceIssues.map((issue, i) => (
                                          <div key={i} className="p-4 rounded-md border bg-white">
                                            <div className="flex items-center justify-between mb-2">
                                              <h4 className="font-semibold">{issue.auditArea}</h4>
                                              <Badge variant={issue.classification === 'Compliance Issue' ? 'destructive' : 'secondary'}>{issue.classification}</Badge>
                                            </div>
                                            <p className="text-sm text-gray-800 mb-2">{issue.summary}</p>
                                            <p className="text-xs text-muted-foreground border-t pt-2 mt-2">
                                              <span className="font-semibold">Reasoning:</span> {issue.reasoning}
                                            </p>
                                          </div>
                                        ))}
                                      </div>
                                    ) : <p className="text-green-600 p-4 bg-green-50 rounded-md">No compliance issues found.</p>}
                                </div>
                            </>
                        ) : (
                            <p>No analysis available for this document.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Card className="sticky top-24">
                    <CardHeader>
                        <CardTitle>Ask a Question</CardTitle>
                        <CardDescription>Ask the AI about this document.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 overflow-y-auto space-y-4 p-4 border rounded-md mb-4 bg-white">
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
                                placeholder="What is the termination date?"
                                disabled={isChatting}
                            />
                            <Button type="submit" disabled={isChatting || !chatMessage}>Send</Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useFirestore, useAuth } from '@/firebase';
import {
  doc,
  setDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useCollection } from '@/firebase/firestore/use-collection';
import { analyzeDocument } from '@/ai/flows/analyze-document';
import type { DocumentAnalysis } from '@/ai/schemas';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Upload, FileText, Bot, User } from 'lucide-react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

interface DocumentData {
  id: string;
  fileName: string;
  createdAt: any;
  analysis?: DocumentAnalysis;
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

  const documentsPath = user ? `users/${user.uid}/documents` : undefined;
  const { data: documents, loading: docsLoading } = useCollection<DocumentData>(
    documentsPath
  );

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

        // Call Genkit flow
        const analysisResult = await analyzeDocument({
          fileContent,
          fileName: selectedFile.name,
        });

        const newDocRef = doc(collection(db, `users/${user.uid}/documents`));
        const newDocData = {
          fileName: selectedFile.name,
          createdAt: serverTimestamp(),
          analysis: analysisResult,
          fileContent: fileContent, // Storing base64 content
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
      // This would be a call to a Genkit flow for Q&A
      // For now, we'll just simulate a response
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


  if (userLoading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8] font-body text-black">
      <Header />
      <main className="grid grid-cols-1 md:grid-cols-3 gap-8 p-8">
        {/* Left Column */}
        <div className="md:col-span-1 space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Upload Document</CardTitle>
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
            <CardContent>
              {docsLoading ? (
                <div className="space-y-2">
                    <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
                    <div className="h-10 w-full animate-pulse rounded-md bg-gray-200" />
                </div>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="md:col-span-2">
          {selectedDoc ? (
            <div className="space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Analysis for: {selectedDoc.fileName}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {selectedDoc.analysis ? (
                             <div className="space-y-6">
                                <div>
                                    <h3 className="font-bold text-lg mb-2">Summary</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedDoc.analysis.summary}</p>
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
                                        <ul className="list-disc list-inside space-y-1 text-red-600">
                                            {selectedDoc.analysis.complianceIssues.map((issue, i) => <li key={i}>{issue}</li>)}
                                        </ul>
                                    ) : <p className="text-green-600">No compliance issues found.</p>}
                                </div>
                            </div>
                        ) : (
                            <p>No analysis available for this document.</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Chat about this document</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-64 overflow-y-auto space-y-4 p-4 border rounded-md mb-4 bg-white">
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
                                placeholder="Ask a question about the document..."
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
      </main>
    </div>
  );
}

"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { summarizeResearchDocument } from '@/ai/flows/summarize-research-documents';
import { Loader2, UploadCloud } from 'lucide-react';
import { Skeleton } from './ui/skeleton';

export function ResearchAssistantSection() {
  const [file, setFile] = useState<File | null>(null);
  const [summary, setSummary] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      if (e.target.files[0].type !== 'application/pdf') {
        toast({
          title: 'Invalid File Type',
          description: 'Please upload a PDF document.',
          variant: 'destructive',
        });
        setFile(null);
        e.target.value = ''; // Reset file input
        return;
      }
      setFile(e.target.files[0]);
      setSummary(''); // Clear previous summary
    }
  };
  
  const handleSummarize = async () => {
    if (!file) {
      toast({
        title: 'No file selected',
        description: 'Please select a PDF document to summarize.',
        variant: 'destructive',
      });
      return;
    }
    
    setIsLoading(true);
    setSummary('');

    const readFileAsDataURL = (fileToRead: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = (error) => reject(error);
            reader.readAsDataURL(fileToRead);
        });
    }

    try {
        const documentDataUri = await readFileAsDataURL(file);
        const result = await summarizeResearchDocument({ documentDataUri });
        setSummary(result.summary);
    } catch (error) {
        console.error('Summarization failed:', error);
        toast({
            title: 'Summarization Failed',
            description: 'An error occurred. Please ensure you uploaded a valid PDF document.',
            variant: 'destructive',
        });
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <section id="research" className="w-full py-12 md:py-24 lg:py-32 bg-card">
      <div className="container max-w-4xl px-4 md:px-6">
        <Card className="bg-background/50">
          <CardHeader className="text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl font-headline">Research Assistant</h2>
            <CardDescription className="max-w-[900px] mx-auto text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Upload a research paper (PDF) and our AI will provide a concise summary of its key findings.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center gap-4">
              <label htmlFor="file-upload" className="flex-1 w-full cursor-pointer">
                <div className="flex items-center justify-center w-full h-12 px-4 py-2 border-2 border-dashed rounded-md border-border hover:border-primary transition-colors">
                  <UploadCloud className="w-5 h-5 mr-2 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">{file ? file.name : 'Click to upload a PDF'}</span>
                </div>
                <Input id="file-upload" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf" disabled={isLoading} />
              </label>
              <Button onClick={handleSummarize} disabled={!file || isLoading} className="w-full sm:w-auto">
                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {isLoading ? 'Summarizing...' : 'Summarize'}
              </Button>
            </div>
            {(isLoading || summary) && (
              <Card>
                <CardHeader>
                  <CardTitle className="font-headline">Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-[90%]" />
                        <Skeleton className="h-4 w-[95%]" />
                        <Skeleton className="h-4 w-[85%]" />
                    </div>
                  ) : (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{summary}</p>
                  )}
                </CardContent>
              </Card>
            )}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}

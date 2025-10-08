import { Header } from '@/components/Header';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Upload, FileText, MessageSquare } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50/50">
      <Header />
      <main className="container mx-auto max-w-4xl py-12 px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-light tracking-tight">Help Center</h1>
          <p className="mt-2 text-lg text-gray-600">
            Your guide to using Synapse AI.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>How It Works</CardTitle>
          </CardHeader>
          <CardContent>
            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <Upload className="h-5 w-5 text-primary" />
                    <span className="font-semibold">
                      Step 1: Upload Your Document
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base pl-8">
                  Navigate to your dashboard and use the upload panel. You can
                  either drag and drop a file or click to select a file from
                  your computer. We support PDF, DOCX, and DOC formats. Once
                  uploaded, our AI begins the analysis immediately.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-primary" />
                    <span className="font-semibold">
                      Step 2: Review the Analysis
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base pl-8">
                  After processing, your document will appear in the "Document
                  History" list. Click on it to view the full analysis. The
                  results panel will show you an executive summary, a table of
                  extracted data (like parties, dates, and amounts), and a list
                  of any potential compliance issues we've flagged for your
                  review.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>
                  <div className="flex items-center gap-3">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    <span className="font-semibold">
                      Step 3: Ask Questions
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-base pl-8">
                  Once a document is selected, you can use the "Ask a Question"
                  panel. Type your question in plain English, such as "What is
                  the termination date?" or "Are there any unusual clauses?".
                  The AI will read through the document context and provide a
                  direct answer.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

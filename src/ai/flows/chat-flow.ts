/**
 * @fileoverview Chat/Q&A flow for document interaction and follow-up questions
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { logger } from '@/shared/lib/logger';

// Chat message input schema
const ChatMessageInputSchema = z.object({
  documentId: z.string().uuid(),
  message: z.string().min(1).max(4000),
  context: z.object({
    previousMessages: z.array(z.object({
      role: z.enum(['user', 'assistant']),
      content: z.string(),
    })).max(10).default([]),
    documentSummary: z.string().optional(),
    userRole: z.enum(['admin', 'analyst', 'viewer']).default('viewer'),
  }).optional(),
});

// Chat response schema
const ChatResponseSchema = z.object({
  response: z.string().min(1).max(4000),
  confidence: z.number().min(0).max(100),
  sources: z.array(z.string()).max(5),
  reasoning: z.array(z.string()).min(1).max(5),
  suggestions: z.array(z.string()).max(3).optional(),
  followUpQuestions: z.array(z.string()).max(3).optional(),
});

export type ChatMessageInput = z.infer<typeof ChatMessageInputSchema>;
export type ChatResponse = z.infer<typeof ChatResponseSchema>;

// Chat prompt for document Q&A
const chatPrompt = ai.definePrompt({
  name: 'documentChatPrompt',
  input: { schema: ChatMessageInputSchema },
  output: { schema: ChatResponseSchema },
  prompt: `You are an AI assistant specialized in document analysis and compliance questions. You have access to a specific document and its analysis.

Document Context:
- Document ID: {{documentId}}
- Summary: {{context.documentSummary}}
- User Role: {{context.userRole}}

Previous Conversation:
{{#context.previousMessages}}
{{#role}}{{role}}: {{/role}}{{content}}
{{/context.previousMessages}}

Current Question: {{message}}

Instructions:
1. Answer based on the document content and analysis
2. Be precise and cite specific sections when possible
3. If the question is outside the document scope, politely redirect
4. For compliance questions, reference relevant standards (ISO, SOC 2, SOX, GDPR, etc.)
5. Provide confidence scores based on how directly the information appears in the document
6. Suggest follow-up questions when appropriate
7. Maintain conversation context and avoid repeating information

Response Format:
- Provide a clear, helpful answer
- Include confidence score (0-100)
- List any specific sources or sections referenced
- Add reasoning for your classifications or conclusions
- Suggest related questions if relevant

Remember: You can only discuss information from this specific document. Do not reference external knowledge or other documents.`,
});

// Chat flow for document Q&A
const documentChatFlow = ai.defineFlow(
  {
    name: 'documentChatFlow',
    inputSchema: ChatMessageInputSchema,
    outputSchema: ChatResponseSchema,
  },
  async (input) => {
    const startTime = Date.now();

    try {
      const { output } = await chatPrompt(input);

      if (!output) {
        throw new Error('Chat response generation failed');
      }

      // Enhance with additional metadata
      const enhancedResponse = {
        ...output,
        processingTime: Date.now() - startTime,
        model: 'gemini-2.0-flash',
        timestamp: new Date().toISOString(),
      };

      await logger.info('Document chat response generated', {
        documentId: input.documentId,
        messageLength: input.message.length,
        responseLength: output.response.length,
        confidence: output.confidence,
        processingTime: enhancedResponse.processingTime,
      });

      return enhancedResponse;
    } catch (error) {
      await logger.error('Document chat flow failed', error as Error, {
        documentId: input.documentId,
        messageLength: input.message.length,
        processingTime: Date.now() - startTime,
      });

      throw error;
    }
  }
);

// Main chat function
export async function askDocumentQuestion(input: ChatMessageInput): Promise<ChatResponse> {
  return documentChatFlow(input);
}

// Context memory service for maintaining conversation history
export class ChatContextService {
  private static instance: ChatContextService;
  private contextStore = new Map<string, any[]>();

  static getInstance(): ChatContextService {
    if (!ChatContextService.instance) {
      ChatContextService.instance = new ChatContextService();
    }
    return ChatContextService.instance;
  }

  // Store conversation context
  storeContext(sessionId: string, context: any): void {
    if (!this.contextStore.has(sessionId)) {
      this.contextStore.set(sessionId, []);
    }

    const contexts = this.contextStore.get(sessionId)!;
    contexts.push(context);

    // Keep only last 10 messages for memory efficiency
    if (contexts.length > 10) {
      contexts.shift();
    }
  }

  // Retrieve conversation context
  getContext(sessionId: string): any[] {
    return this.contextStore.get(sessionId) || [];
  }

  // Clear conversation context
  clearContext(sessionId: string): void {
    this.contextStore.delete(sessionId);
  }

  // Get context summary for prompt
  getContextSummary(sessionId: string): string {
    const contexts = this.getContext(sessionId);
    if (contexts.length === 0) {
      return 'No previous context available.';
    }

    return contexts
      .slice(-3) // Last 3 messages for context
      .map(ctx => `${ctx.role}: ${ctx.content.substring(0, 100)}...`)
      .join('\n');
  }
}

// Export singleton instance
export const chatContextService = ChatContextService.getInstance();

// Enhanced chat function with context memory
export async function askDocumentQuestionWithContext(
  documentId: string,
  message: string,
  sessionId: string,
  userRole: 'admin' | 'analyst' | 'viewer' = 'viewer'
): Promise<ChatResponse> {
  // Get conversation context
  const previousMessages = chatContextService.getContext(sessionId);

  // Prepare input with context
  const input: ChatMessageInput = {
    documentId,
    message,
    context: {
      previousMessages,
      userRole,
    },
  };

  // Get AI response
  const response = await askDocumentQuestion(input);

  // Store the conversation in context
  chatContextService.storeContext(sessionId, {
    role: 'user',
    content: message,
    timestamp: new Date(),
  });

  chatContextService.storeContext(sessionId, {
    role: 'assistant',
    content: response.response,
    confidence: response.confidence,
    timestamp: new Date(),
  });

  return response;
}
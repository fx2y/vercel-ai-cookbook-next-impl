import { openai } from '@ai-sdk/openai';
import { experimental_generateImage, Message, streamText, tool } from 'ai';
import { z } from 'zod';

// Validate request shape
const chatRequestSchema = z.object({
  messages: z.array(z.object({
    content: z.string(),
    role: z.enum(['user', 'assistant', 'system']),
    toolInvocations: z.array(z.any()).optional()
  }))
});

export async function POST(request: Request) {
  try {
    const { messages } = await chatRequestSchema.parseAsync(await request.json());

    // Add rate limiting check here if needed
    // if (await isRateLimited()) throw new Error('Rate limit exceeded');

    // Filter messages to redact base64 image data
    const filteredMessages = messages.map(m => {
      if (m.role === 'assistant' && m.toolInvocations) {
        return {
          ...m,
          toolInvocations: m.toolInvocations.map(ti => {
            if (ti.toolName === 'generateImage' && ti.state === 'result') {
              return { ...ti, result: { ...ti.result, image: '[redacted]' } };
            }
            return ti;
          }),
        };
      }
      return m;
    });

    const result = streamText({
      model: openai('gpt-4o-mini'),
      messages: filteredMessages,
      tools: {
        generateImage: tool({
          description: 'Generate an image',
          parameters: z.object({
            prompt: z.string().describe('Image prompt to generate visuals from'),
            style: z.enum(['natural', 'vivid']).optional()
              .describe('Image style preference'),
          }),
          execute: async ({ prompt, style = 'natural' }) => {
            try {
              const { image } = await experimental_generateImage({
                model: openai.image('dall-e-3'),
                prompt,
                style
              });
              
              // TODO: In production, save to blob storage and return URL
              return { 
                image: image.base64, 
                prompt,
                metadata: {
                  generated: new Date().toISOString(),
                  style
                }
              };
            } catch (error) {
              console.error('Image generation failed:', error);
              return { 
                error: 'Failed to generate image', 
                details: error instanceof Error ? error.message : 'Unknown error'
              };
            }
          },
        }),
      },
    });

    return result.toDataStreamResponse();
  } catch (error) {
    console.error('Chat request failed:', error);
    return Response.json({ 
      error: 'Failed to process request',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

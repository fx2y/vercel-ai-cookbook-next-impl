import { openai } from '@ai-sdk/openai';
import { Message, streamText } from 'ai';
import { z } from 'zod';

const chatRequestSchema = z.object({
  messages: z.array(z.object({
    content: z.string(),
    role: z.enum(['user', 'assistant', 'system'])
  }))
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages } = chatRequestSchema.parse(body);
    
    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: 'You are a helpful assistant.',
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return Response.json({ error: 'Invalid request format' }, { status: 400 });
    }
    
    return Response.json(
      { error: 'Internal server error' }, 
      { status: 500 }
    );
  }
}

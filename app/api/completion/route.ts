import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';

// Define request schema for validation
const requestSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required'),
});

export async function POST(req: Request) {
  try {
    // Parse and validate request body
    const body = await req.json();
    const result = requestSchema.safeParse(body);

    if (!result.success) {
      return Response.json(
        { error: 'Invalid request: ' + result.error.message },
        { status: 400 }
      );
    }

    // Generate text using OpenAI
    const { text } = await generateText({
      model: openai('gpt-4o-mini'),
      system: 'You are a helpful assistant that provides clear, concise answers.',
      prompt: result.data.prompt,
    });

    return Response.json({ text });
  } catch (error) {
    // Log error for debugging but send safe message to client
    console.error('Error in completion route:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return Response.json(
      { error: 'Failed to generate text', details: errorMessage },
      { status: 500 }
    );
  }
}

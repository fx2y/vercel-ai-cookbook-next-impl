import { openai } from '@ai-sdk/openai';
import { streamText, tool, ToolInvocation } from 'ai';
import { z } from 'zod';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  toolInvocations?: ToolInvocation[];
}

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  const result = streamText({
    model: openai('gpt-4o-mini'),
    system: 'You are a helpful assistant. You can help users check weather information for any city.',
    messages,
    tools: {
      getWeather: tool({
        description: 'Get weather for a location',
        parameters: z.object({
          city: z.string().describe('City name'),
          unit: z.enum(['C', 'F']).describe('Temperature unit')
        }),
        execute: async ({ city, unit }) => {
          // Mock weather data for demonstration
          const temp = Math.floor(Math.random() * 30) + 10; // Random temp between 10-40
          const descriptions = ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'];
          const description = descriptions[Math.floor(Math.random() * descriptions.length)];
          
          const tempInUnit = unit === 'F' ? (temp * 9/5) + 32 : temp;
          return {
            value: tempInUnit,
            description,
            unit
          };
        }
      })
    }
  });

  return result.toDataStreamResponse();
}

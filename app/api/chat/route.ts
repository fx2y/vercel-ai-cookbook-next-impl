import { openai } from '@ai-sdk/openai';
import {
  createDataStreamResponse,
  formatDataStreamPart,
  Message,
  streamText,
  tool
} from 'ai';
import { z } from 'zod';

// Static weather data function
async function executeWeatherTool({ city }: { city: string }) {
  const weatherOptions = ['sunny', 'cloudy', 'rainy', 'snowy'];
  const temperature = Math.floor(Math.random() * 30) + 10; // 10-40°C
  return {
    condition: weatherOptions[Math.floor(Math.random() * weatherOptions.length)],
    temperature: temperature,
    city
  };
}

export async function POST(req: Request) {
  const { messages }: { messages: Message[] } = await req.json();

  return createDataStreamResponse({
    execute: async dataStream => {
      // Process last message for tool results
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.parts) {
        const processedParts = await Promise.all(
          lastMessage.parts.map(async part => {
            if (part.type !== 'tool-invocation') return part;

            const { toolInvocation } = part;
            if (toolInvocation.toolName !== 'getWeatherInformation' || toolInvocation.state !== 'result') {
              return part;
            }

            if (toolInvocation.result === 'Yes, confirmed.') {
              const result = await executeWeatherTool(toolInvocation.args);
              dataStream.write(formatDataStreamPart('tool_result', {
                toolCallId: toolInvocation.toolCallId,
                result
              }));
            } else if (toolInvocation.result === 'No, denied.') {
              dataStream.write(formatDataStreamPart('tool_result', {
                toolCallId: toolInvocation.toolCallId,
                result: { error: 'Weather information request was denied.' }
              }));
            }

            return part;
          })
        );

        lastMessage.parts = processedParts;
      }

      // Set up streaming with tools
      const result = streamText({
        model: openai('gpt-4o-mini'),
        messages,
        tools: {
          getWeatherInformation: tool({
            description: 'Get the weather for a location',
            parameters: z.object({
              city: z.string().describe('The city to get weather for')
            })
            // No execute function - requires human confirmation
          })
        }
      });

      result.mergeIntoDataStream(dataStream);
    }
  });
}

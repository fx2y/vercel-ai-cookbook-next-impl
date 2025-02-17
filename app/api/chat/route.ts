import { openai } from '@ai-sdk/openai';
import {
  createDataStreamResponse,
  formatDataStreamPart,
  Message,
  streamText,
  tool
} from 'ai';
import { z } from 'zod';
import { ToolResults } from '@/app/lib/constants';
import { WeatherService } from '@/app/lib/weather';

// Initialize weather service
const weatherService = new WeatherService(process.env.OPENWEATHER_API_KEY);

// Weather tool execution function
async function executeWeatherTool({ city }: { city: string }) {
  try {
    return await weatherService.getWeather(city);
  } catch (error) {
    return { error: error instanceof Error ? error.message : 'Failed to fetch weather data' };
  }
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

            if (toolInvocation.result === ToolResults.CONFIRMED) {
              const result = await executeWeatherTool(toolInvocation.args);
              dataStream.write(formatDataStreamPart('tool_result', {
                toolCallId: toolInvocation.toolCallId,
                result
              }));
            } else if (toolInvocation.result === ToolResults.DENIED) {
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
            description: 'Get real-time weather for a location',
            parameters: z.object({
              city: z.string().describe('The city to get weather for')
            })
          }),
          getLocation: {
            description: 'Get user location',
            parameters: z.object({})
          }
        }
      });

      result.mergeIntoDataStream(dataStream);
    }
  });
}

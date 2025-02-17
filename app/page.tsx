'use client';

import { useChat } from '@ai-sdk/react';
import { Message } from 'ai';
import { ToolResults } from './lib/constants';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } = useChat({
    api: '/api/chat',
    onToolCall: async ({ toolCall }) => {
      if (toolCall.toolName === 'getLocation') {
        // For demo purposes, return a static location
        // In a real app, you could use the browser's geolocation API
        return 'San Francisco';
      }
    }
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map((m: Message) => (
          <div key={m.id} className="whitespace-pre-wrap">
            <strong>{m.role}: </strong>
            {m.content}
            {m.parts?.map((part, i) => {
              if (part.type !== 'tool-invocation') return null;
              const { toolInvocation } = part;

              if (toolInvocation.toolName === 'getWeatherInformation') {
                if (toolInvocation.state === 'call') {
                  return (
                    <div key={i} className="mt-4 p-6 border-2 border-blue-200 rounded-lg bg-blue-50 shadow-lg">
                      <p className="mb-4 text-lg font-semibold text-blue-900">
                        🌤️ Get weather information for {toolInvocation.args.city}?
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => addToolResult({
                            toolCallId: toolInvocation.toolCallId,
                            result: ToolResults.CONFIRMED
                          })}
                          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 shadow-md"
                        >
                          ✓ Yes
                        </button>
                        <button
                          onClick={() => addToolResult({
                            toolCallId: toolInvocation.toolCallId,
                            result: ToolResults.DENIED
                          })}
                          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 shadow-md"
                        >
                          ✗ No
                        </button>
                      </div>
                    </div>
                  );
                } else if (toolInvocation.state === 'result') {
                  const result = toolInvocation.result;
                  if (result.error) {
                    return (
                      <div key={i} className="mt-2 p-4 border rounded-lg bg-red-50">
                        {result.error}
                      </div>
                    );
                  } else if (result.condition && result.temperature) {
                    return (
                      <div key={i} className="mt-2 p-4 border rounded-lg bg-blue-50">
                        <p>Weather in {result.city}:</p>
                        <p>Condition: {result.condition}</p>
                        <p>Temperature: {result.temperature}°C</p>
                      </div>
                    );
                  }
                }
              }

              if (toolInvocation.toolName === 'getLocation') {
                if (toolInvocation.state === 'result') {
                  return (
                    <div key={i} className="ml-4 mt-2 text-sm bg-gray-100 p-2 rounded">
                      📍 Location: {toolInvocation.result}
                    </div>
                  );
                } else {
                  return (
                    <div key={i} className="ml-4 mt-2 text-sm bg-gray-100 p-2 rounded">
                      Getting location...
                    </div>
                  );
                }
              }

              return null;
            })}
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full max-w-md p-2 mb-8 border border-gray-300 rounded shadow-xl">
        <input
          className="w-full p-2 rounded"
          value={input}
          placeholder="Ask about the weather..."
          onChange={handleInputChange}
        />
      </form>
    </div>
  );
}

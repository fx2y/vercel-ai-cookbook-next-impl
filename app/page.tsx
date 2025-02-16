'use client';

import { Message, useChat } from '@ai-sdk/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, addToolResult } = useChat();

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
                    <div key={i} className="mt-2 p-4 border rounded-lg">
                      <p className="mb-2">Get weather information for {toolInvocation.args.city}?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => addToolResult({
                            toolCallId: toolInvocation.toolCallId,
                            result: 'Yes, confirmed.'
                          })}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Yes
                        </button>
                        <button
                          onClick={() => addToolResult({
                            toolCallId: toolInvocation.toolCallId,
                            result: 'No, denied.'
                          })}
                          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                        >
                          No
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

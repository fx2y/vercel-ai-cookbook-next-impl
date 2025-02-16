'use client';

import { useChat } from '@ai-sdk/react';
import { ToolInvocation } from 'ai';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    maxSteps: 2
  });

  return (
    <div className="flex flex-col w-full max-w-md py-24 mx-auto stretch">
      <div className="space-y-4">
        {messages.map(message => (
          <div key={message.id} className="whitespace-pre-wrap flex flex-col gap-1">
            <strong>{message.role === 'user' ? 'User: ' : 'AI: '}</strong>
            {message.content}
            
            {message.toolInvocations?.map((ti: ToolInvocation, index: number) => {
              if (ti.toolName === 'getWeather') {
                if (ti.state === 'result') {
                  const result = ti.result;
                  return (
                    <div key={index} className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <div className="font-medium">Weather in {ti.args.city}</div>
                      <div>{result.value}°{result.unit}</div>
                      <div className="text-gray-600">{result.description}</div>
                    </div>
                  );
                }
                return (
                  <div key={index} className="mt-2 text-gray-500 italic">
                    Checking weather...
                  </div>
                );
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

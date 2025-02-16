'use client';

import { useChat } from '@ai-sdk/react';
import { useEffect, useRef } from 'react';

export default function Page() {
  const { messages, input, setInput, append, isLoading, error } = useChat({
    api: '/api/chat',
  });
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  if (error) {
    return (
      <div className="text-red-500 p-4">
        Error: {error.message}
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full max-w-md mx-auto p-4">
      <div className="flex flex-col space-y-4 mb-4">
        {messages.map(message => (
          <div 
            key={message.id} 
            className={`p-2 rounded ${
              message.role === 'assistant' ? 'bg-gray-100' : ''
            }`}
          >
            <strong>{message.role}: </strong>
            {message.content}
          </div>
        ))}
        {isLoading && (
          <div className="text-gray-500 p-2">
            Assistant is typing...
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            append({
              content: input,
              role: 'user',
            });
            setInput('');
          }
        }}
        placeholder="Type a message..."
        className="w-full p-2 border rounded"
        autoFocus
      />
    </div>
  );
}

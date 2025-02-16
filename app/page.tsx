'use client';

import { useChat } from '@ai-sdk/react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

export default function Page() {
  const { messages, input, setInput, append, isLoading, error } = useChat({
    api: '/api/chat',
  });
  
  const inputRef = useRef<HTMLInputElement>(null);
  const [imageLoading, setImageLoading] = useState<{[key: string]: boolean}>({});
  const [imageErrors, setImageErrors] = useState<{[key: string]: string}>({});

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

  const handleImageLoadError = (toolCallId: string) => {
    setImageErrors(prev => ({
      ...prev,
      [toolCallId]: 'Failed to load image'
    }));
    setImageLoading(prev => ({
      ...prev,
      [toolCallId]: false
    }));
  };

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
            
            {message.toolInvocations?.map(ti => {
              if (ti.toolName !== 'generateImage') return null;
              
              const toolCallId = ti.toolCallId;
              
              if (ti.state === 'call') {
                return (
                  <div key={toolCallId} className="animate-pulse space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                    <div className="text-gray-500">
                      Generating image for: {ti.args.prompt}...
                    </div>
                  </div>
                );
              }
              
              if (ti.state === 'result') {
                if ('error' in ti.result) {
                  return (
                    <div key={toolCallId} className="text-red-500 space-y-1">
                      <div>Failed to generate image:</div>
                      <div className="text-sm">{ti.result.error}</div>
                      {ti.result.details && (
                        <div className="text-xs text-red-400">{ti.result.details}</div>
                      )}
                    </div>
                  );
                }
                
                return (
                  <div key={toolCallId} className="mt-2 relative">
                    {imageLoading[toolCallId] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                    {imageErrors[toolCallId] ? (
                      <div className="text-red-500 text-sm">{imageErrors[toolCallId]}</div>
                    ) : (
                      <Image
                        src={`data:image/png;base64,${ti.result.image}`}
                        alt={ti.result.prompt}
                        width={512}
                        height={512}
                        className="rounded-lg shadow-lg"
                        priority={true}
                        onLoadingComplete={() => {
                          setImageLoading(prev => ({ ...prev, [toolCallId]: false }));
                        }}
                        onError={() => handleImageLoadError(toolCallId)}
                      />
                    )}
                    {ti.result.metadata && (
                      <div className="mt-1 text-xs text-gray-500">
                        Generated {new Date(ti.result.metadata.generated).toLocaleString()} 
                        {ti.result.metadata.style && ` • Style: ${ti.result.metadata.style}`}
                      </div>
                    )}
                  </div>
                );
              }
            })}
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

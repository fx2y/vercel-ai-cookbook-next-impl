'use client';

import { useState } from 'react';

// Define interface for API response
interface CompletionResponse {
  text: string;
}

export default function Page() {
  const [generation, setGeneration] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateText = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/completion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: 'Why is the sky blue?',
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate text: ${response.statusText}`);
      }

      const data: CompletionResponse = await response.json();
      setGeneration(data.text);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      console.error('Error generating text:', error);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl p-4">
      <button
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300 transition-colors"
        onClick={generateText}
        disabled={isLoading}
      >
        {isLoading ? 'Generating...' : 'Generate'}
      </button>

      <div className="mt-4">
        {isLoading && (
          <div className="flex items-center text-gray-500">
            <div className="animate-spin h-5 w-5 mr-3 border-2 border-blue-500 rounded-full border-t-transparent"></div>
            Generating response...
          </div>
        )}
        {error && (
          <p className="text-red-500">{error}</p>
        )}
        {!isLoading && !error && generation && (
          <p className="whitespace-pre-wrap prose">{generation}</p>
        )}
      </div>
    </div>
  );
}

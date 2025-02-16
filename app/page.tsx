'use client';

import { experimental_useObject as useObject } from '@ai-sdk/react';
import { z } from 'zod';
import { notificationSchema } from './api/use-object/schema';

export default function Page() {
  const { object, submit, isLoading, stop } = useObject({
    api: '/api/use-object',
    schema: z.array(notificationSchema),
  });

  return (
    <div className="flex flex-col gap-4 p-4">
      <button
        onClick={() => submit('Messages during finals week.')}
        disabled={isLoading}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        Generate notifications
      </button>

      {isLoading && (
        <div className="flex items-center gap-2">
          <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
          <span>Generating notifications...</span>
        </div>
      )}

      <div className="space-y-4">
        {object && object.map((notification, index) => (
          <div key={index} className="p-4 border rounded-lg shadow">
            <h3 className="font-semibold text-lg">{notification?.name}</h3>
            <p className="text-gray-600">{notification?.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

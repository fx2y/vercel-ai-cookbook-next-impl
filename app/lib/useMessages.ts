import { useChat, Message } from '@ai-sdk/react';
import { useEffect } from 'react';

const STORAGE_KEY = 'chat_messages';
const MAX_MESSAGES = 100; // Prevent localStorage from getting too full

export function useMessages() {
  const chat = useChat({
    api: '/api/chat',
    initialMessages: loadMessages()
  });

  // Save messages when they change
  useEffect(() => {
    try {
      // Keep only the latest messages if we exceed the limit
      const messagesToStore = chat.messages.slice(-MAX_MESSAGES);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messagesToStore));
    } catch (error: any) { // Type assertion for browser storage errors
      console.error('Failed to save messages:', error);
      // If localStorage is full, clear it and try again
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        localStorage.clear();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(chat.messages.slice(-20)));
      }
    }
  }, [chat.messages]);

  return {
    ...chat,
    clearMessages: () => {
      localStorage.removeItem(STORAGE_KEY);
      chat.reload();
    }
  };
}

function loadMessages(): Message[] {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (error) {
    console.error('Failed to load messages:', error);
    return [];
  }
}
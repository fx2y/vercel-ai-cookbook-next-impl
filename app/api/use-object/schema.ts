import { z } from 'zod';

export const notificationSchema = z.object({
  name: z.string().describe('The name/title of the notification'),
  message: z.string().describe('The message content of the notification'),
});
import { z } from 'zod';

export const ChatDto = z.object({
  message: z.string().min(1).max(2000),
  sessionId: z.string().optional(),
});

export const SearchDto = z.object({
  query: z.string().min(1).max(500),
  topK: z.coerce.number().int().min(1).max(20).default(5),
});

export type ChatInput = z.infer<typeof ChatDto>;
export type SearchInput = z.infer<typeof SearchDto>;

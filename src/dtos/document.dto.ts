import { z } from 'zod';

export const DocumentDTO = z.object({
  name: z.string().min(1, "Name is required"),
  tags: z.string().min(1, "Tags are required")
});

export type DocumentInput = z.infer<typeof DocumentDTO>;


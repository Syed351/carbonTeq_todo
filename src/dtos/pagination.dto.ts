import { z } from "zod";

export const paginationDTO = z.object({
  page: z.string().optional().transform(val => parseInt(val ?? "1")),
  limit: z.string().optional().transform(val => parseInt(val ?? "10")),
});

export type PaginationInput = z.infer<typeof paginationDTO>;


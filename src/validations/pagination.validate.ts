import { z } from "zod";

export const paginationValidate = z.object({
  page: z.string().optional().transform(val => parseInt(val ?? "1")),
  limit: z.string().optional().transform(val => parseInt(val ?? "10")),
});



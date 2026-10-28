import { z } from "zod";

export const transactionFilterSchema = z.object({
  status: z.enum(["pending", "completed", "failed"]).optional(),
  search: z.string().optional(),
});

export type TransactionFilterValues = z.infer<typeof transactionFilterSchema>;

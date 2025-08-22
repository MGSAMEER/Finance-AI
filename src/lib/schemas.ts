import { z } from "zod";
import { Category, TxType } from "@/lib/types";

const categoryEnum = z.enum([
  "Food",
  "Travel",
  "Rent",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Groceries",
  "Other",
] as [Category, ...Category[]]);

const baseTransactionInput = z.object({
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  category: categoryEnum,
  date: z
    .string()
    .refine((v) => !Number.isNaN(Date.parse(v)), {
      message: "Invalid date",
    }),
  note: z.string().max(120, "Note must be at most 120 characters").optional(),
});

export const expenseInputSchema = baseTransactionInput.extend({
  type: z.literal("expense" satisfies TxType),
});

export const incomeInputSchema = baseTransactionInput.extend({
  type: z.literal("income" satisfies TxType),
});

export type ExpenseInput = z.infer<typeof expenseInputSchema>;
export type IncomeInput = z.infer<typeof incomeInputSchema>;

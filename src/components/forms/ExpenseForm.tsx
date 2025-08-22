"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type Resolver, Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { expenseInputSchema, type ExpenseInput } from "@/lib/schemas";
import { Category } from "@/lib/types";
import { db } from "@/lib/db";
import { uid } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const categories: Category[] = [
  "Food",
  "Travel",
  "Rent",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Groceries",
  "Other",
];

export function ExpenseForm() {
  const router = useRouter();
  const { toast } = useToast();
  const form = useForm<ExpenseInput>({
    resolver: zodResolver(expenseInputSchema) as Resolver<ExpenseInput>,
    defaultValues: {
      type: "expense",
      amount: 0,
      category: "Other",
      date: new Date().toISOString().slice(0, 10),
      note: "",
    },
    mode: "onBlur",
  });

  const onSubmit = async (values: ExpenseInput) => {
    await db.transactions.add({
      id: uid(),
      ...values,
    });
    toast({ title: "Expense saved", description: "Your expense was added." });
    router.push("/");
  };

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = form;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Amount</label>
        <Input type="number" step="0.01" {...register("amount", { valueAsNumber: true })} />
        {errors.amount && (
          <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Category</label>
        <Controller
          control={control}
          name="category"
          render={({ field }) => (
            <Select value={field.value} onValueChange={field.onChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        />
        {errors.category && (
          <p className="text-sm text-destructive mt-1">{errors.category.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Date</label>
        <Input type="date" {...register("date")} />
        {errors.date && (
          <p className="text-sm text-destructive mt-1">{errors.date.message}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Note</label>
        <Textarea rows={4} placeholder="Optional" {...register("note")} />
        {errors.note && (
          <p className="text-sm text-destructive mt-1">{errors.note.message}</p>
        )}
      </div>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save Expense"}
      </Button>
    </form>
  );
}

"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { Category } from "@/lib/types";
import { createBudget } from "@/lib/budgets";
import { useToast } from "@/hooks/use-toast";

const budgetSchema = z.object({
  category: z.string().min(1, "Category is required"),
  monthlyLimit: z.number().positive("Monthly limit must be greater than 0"),
});

type BudgetInput = z.infer<typeof budgetSchema>;

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

interface CreateBudgetDialogProps {
  onBudgetCreated: () => void;
  existingCategories: Category[];
}

export function CreateBudgetDialog({ onBudgetCreated, existingCategories }: CreateBudgetDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetInput>({
    resolver: zodResolver(budgetSchema),
  });

  const availableCategories = categories.filter(cat => !existingCategories.includes(cat));

  const onSubmit = async (data: BudgetInput) => {
    try {
      await createBudget(data.category as Category, data.monthlyLimit);
      
      toast({
        title: "Budget Created",
        description: `Budget for ${data.category} has been created successfully.`,
      });
      
      reset();
      setOpen(false);
      onBudgetCreated();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create budget",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Create Budget
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Budget</DialogTitle>
          <DialogDescription>
            Set a monthly spending limit for a category to track your expenses.
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select onValueChange={(value) => setValue("category", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {availableCategories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.category && (
              <p className="text-sm text-red-600">{errors.category.message}</p>
            )}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="monthlyLimit">Monthly Limit (₹)</Label>
            <Input
              id="monthlyLimit"
              type="number"
              step="0.01"
              placeholder="Enter monthly limit"
              {...register("monthlyLimit", { valueAsNumber: true })}
            />
            {errors.monthlyLimit && (
              <p className="text-sm text-red-600">{errors.monthlyLimit.message}</p>
            )}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || availableCategories.length === 0}>
              {isSubmitting ? "Creating..." : "Create Budget"}
            </Button>
          </div>
        </form>
        
        {availableCategories.length === 0 && (
          <p className="text-sm text-muted-foreground">
            You have already created budgets for all available categories.
          </p>
        )}
      </DialogContent>
    </Dialog>
  );
}

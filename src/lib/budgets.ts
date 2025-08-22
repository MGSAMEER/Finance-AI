import dayjs from "dayjs";
import { db } from "./db";
import { Budget, Category } from "./types";
import { uid } from "./utils";

export async function createBudget(category: Category, monthlyLimit: number): Promise<Budget> {
  const existingBudget = await db.budgets
    .where("category")
    .equals(category)
    .first();

  if (existingBudget) {
    throw new Error(`Budget for ${category} already exists`);
  }

  const budget: Budget = {
    id: uid(),
    category,
    monthlyLimit,
    spent: 0,
    remaining: monthlyLimit,
    percentage: 0,
    status: "safe",
    createdAt: dayjs().toISOString(),
    updatedAt: dayjs().toISOString(),
  };

  await db.budgets.add(budget);
  return budget;
}

export async function updateBudget(budgetId: string, monthlyLimit: number): Promise<Budget> {
  const budget = await db.budgets.get(budgetId);
  if (!budget) {
    throw new Error("Budget not found");
  }

  const updatedBudget: Budget = {
    ...budget,
    monthlyLimit,
    remaining: monthlyLimit - budget.spent,
    percentage: budget.spent > 0 ? (budget.spent / monthlyLimit) * 100 : 0,
    status: getBudgetStatus(budget.spent, monthlyLimit),
    updatedAt: dayjs().toISOString(),
  };

  await db.budgets.update(budgetId, updatedBudget);
  return updatedBudget;
}

export async function deleteBudget(budgetId: string): Promise<void> {
  await db.budgets.delete(budgetId);
}

export async function getAllBudgets(): Promise<Budget[]> {
  return await db.budgets.toArray();
}

export async function updateBudgetSpending(): Promise<void> {
  const budgets = await getAllBudgets();
  const startOfMonth = dayjs().startOf("month");
  const endOfMonth = dayjs().endOf("month");

  for (const budget of budgets) {
    const spent = await db.transactions
      .where("date")
      .between(startOfMonth.toISOString(), endOfMonth.toISOString())
      .and(t => t.type === "expense" && t.category === budget.category)
      .toArray()
      .then(transactions => 
        transactions.reduce((sum, t) => sum + t.amount, 0)
      );

    const remaining = Math.max(0, budget.monthlyLimit - spent);
    const percentage = budget.monthlyLimit > 0 ? (spent / budget.monthlyLimit) * 100 : 0;
    const status = getBudgetStatus(spent, budget.monthlyLimit);

    await db.budgets.update(budget.id, {
      spent,
      remaining,
      percentage,
      status,
      updatedAt: dayjs().toISOString(),
    });
  }
}

export function getBudgetStatus(spent: number, limit: number): "safe" | "warning" | "exceeded" {
  const percentage = limit > 0 ? (spent / limit) * 100 : 0;
  
  if (percentage >= 100) return "exceeded";
  if (percentage >= 80) return "warning";
  return "safe";
}

export async function getBudgetAlerts(): Promise<Budget[]> {
  const budgets = await getAllBudgets();
  return budgets.filter(budget => budget.status === "warning" || budget.status === "exceeded");
}

export async function getBudgetProgress(category: Category): Promise<Budget | null> {
  return await db.budgets
    .where("category")
    .equals(category)
    .first() || null;
}

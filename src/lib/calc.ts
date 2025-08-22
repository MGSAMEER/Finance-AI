import dayjs from "dayjs";
import { Category } from "./types";
import { db } from "./db";

export interface MonthlyStats {
  income: number;
  expenses: number;
  savings: number;
  topCategory: Category | null;
  topCategoryAmount: number;
}

export interface SavingsProjection {
  currentSavings: number;
  projectedSavings: number;
  increase: number;
  percentageIncrease: number;
}

export interface OverspendAnalysis {
  category: Category;
  currentSpending: number;
  budgetLimit: number;
  overspendAmount: number;
  overspendPercentage: number;
}

export interface InvestmentRecommendation {
  type: string;
  amount: number;
  risk: "low" | "medium" | "high";
  description: string;
  expectedReturn: string;
}

export async function getMonthlyStats(month: string): Promise<MonthlyStats> {
  const startOfMonth = dayjs(month).startOf("month");
  const endOfMonth = dayjs(month).endOf("month");
  
  const transactions = await db.transactions
    .where("date")
    .between(startOfMonth.toISOString(), endOfMonth.toISOString())
    .toArray();

  const income = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const expenses = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const savings = income - expenses;

  // Find top spending category
  const categoryTotals = new Map<Category, number>();
  transactions
    .filter(t => t.type === "expense")
    .forEach(t => {
      categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount);
    });

  let topCategory: Category | null = null;
  let topCategoryAmount = 0;
  
  for (const [category, amount] of categoryTotals) {
    if (amount > topCategoryAmount) {
      topCategory = category;
      topCategoryAmount = amount;
    }
  }

  return {
    income,
    expenses,
    savings,
    topCategory,
    topCategoryAmount,
  };
}

export async function totalIncome(month: string): Promise<number> {
  const stats = await getMonthlyStats(month);
  return stats.income;
}

export async function totalExpenses(month: string): Promise<number> {
  const stats = await getMonthlyStats(month);
  return stats.expenses;
}

export async function topCategory(month: string): Promise<{ category: Category | null; amount: number }> {
  const stats = await getMonthlyStats(month);
  return {
    category: stats.topCategory,
    amount: stats.topCategoryAmount,
  };
}

export async function projectSavingsWithCut(
  month: string,
  category: Category,
  percent: number
): Promise<SavingsProjection> {
  const stats = await getMonthlyStats(month);
  
  // Find current spending in the specified category
  const startOfMonth = dayjs(month).startOf("month");
  const endOfMonth = dayjs(month).endOf("month");
  
  const categoryTransactions = await db.transactions
    .where("date")
    .between(startOfMonth.toISOString(), endOfMonth.toISOString())
    .and(t => t.type === "expense" && t.category === category)
    .toArray();

  const currentCategorySpending = categoryTransactions.reduce((sum, t) => sum + t.amount, 0);
  const reduction = currentCategorySpending * (percent / 100);
  const projectedSavings = stats.savings + reduction;

  return {
    currentSavings: stats.savings,
    projectedSavings,
    increase: reduction,
    percentageIncrease: ((projectedSavings - stats.savings) / stats.savings) * 100,
  };
}

export async function overspendCategories(month: string): Promise<OverspendAnalysis[]> {
  // For now, we'll use some reasonable budget limits
  // In a real app, these would come from user-set budgets
  const budgetLimits: Record<Category, number> = {
    Food: 8000,
    Travel: 5000,
    Rent: 15000,
    Shopping: 3000,
    Bills: 5000,
    Health: 2000,
    Entertainment: 2000,
    Groceries: 4000,
    Other: 1000,
  };

  const startOfMonth = dayjs(month).startOf("month");
  const endOfMonth = dayjs(month).endOf("month");
  
  const transactions = await db.transactions
    .where("date")
    .between(startOfMonth.toISOString(), endOfMonth.toISOString())
    .and(t => t.type === "expense")
    .toArray();

  const categoryTotals = new Map<Category, number>();
  transactions.forEach(t => {
    categoryTotals.set(t.category, (categoryTotals.get(t.category) || 0) + t.amount);
  });

  const overspend: OverspendAnalysis[] = [];
  
  for (const [category, spending] of categoryTotals) {
    const limit = budgetLimits[category];
    if (limit > 0 && spending > limit) {
      overspend.push({
        category,
        currentSpending: spending,
        budgetLimit: limit,
        overspendAmount: spending - limit,
        overspendPercentage: ((spending - limit) / limit) * 100,
      });
    }
  }

  return overspend.sort((a, b) => b.overspendPercentage - a.overspendPercentage);
}

export function monthlySavingGoal(
  income: number,
  expenses: number
): { goal: number; recommendation: string } {
  const savingsRate = (income - expenses) / income;
  
  if (savingsRate >= 0.3) {
    return {
      goal: Math.round((income - expenses) * 0.8),
      recommendation: "excellent",
    };
  } else if (savingsRate >= 0.2) {
    return {
      goal: Math.round((income - expenses) * 0.9),
      recommendation: "good",
    };
  } else if (savingsRate >= 0.1) {
    return {
      goal: Math.round((income - expenses) * 0.95),
      recommendation: "moderate",
    };
  } else {
    return {
      goal: Math.round((income - expenses) * 0.5),
      recommendation: "needs_improvement",
    };
  }
}

export function getInvestmentRecommendation(amount: number): InvestmentRecommendation {
  if (amount >= 50000) {
    return {
      type: "Mutual Funds",
      amount: Math.round(amount * 0.6),
      risk: "medium",
      description: "Diversified equity mutual funds for long-term growth",
      expectedReturn: "12-15% annually",
    };
  } else if (amount >= 25000) {
    return {
      type: "Index Funds",
      amount: Math.round(amount * 0.7),
      risk: "medium",
      description: "Low-cost index funds tracking market performance",
      expectedReturn: "10-12% annually",
    };
  } else if (amount >= 10000) {
    return {
      type: "Fixed Deposits",
      amount: Math.round(amount * 0.8),
      risk: "low",
      description: "Government-backed fixed deposits for stable returns",
      expectedReturn: "6-8% annually",
    };
  } else {
    return {
      type: "Savings Account",
      amount: amount,
      risk: "low",
      description: "High-yield savings account for liquidity",
      expectedReturn: "4-6% annually",
    };
  }
}

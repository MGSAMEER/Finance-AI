import dayjs from "dayjs";
import { db } from "@/lib/db";
import type { Category, Transaction } from "@/lib/types";

export interface CategorySum {
  name: Category;
  value: number;
}

export interface MonthlyTotals {
  month: string; // e.g., 2025-08-01
  income: number;
  expense: number;
}

export async function getCurrentMonthTransactions(): Promise<Transaction[]> {
  const start = dayjs().startOf("month");
  const end = dayjs().endOf("month");
  const all = await db.transactions.toArray();
  return all.filter((t) => {
    const d = dayjs(t.date);
    return d.isAfter(start.subtract(1, "ms")) && d.isBefore(end.add(1, "ms"));
  });
}

export async function getCategorySumsForCurrentMonth(): Promise<CategorySum[]> {
  const monthTx = await getCurrentMonthTransactions();
  const sums = new Map<Category, number>();
  for (const tx of monthTx) {
    if (tx.type !== "expense") continue;
    const prev = sums.get(tx.category as Category) ?? 0;
    sums.set(tx.category as Category, prev + tx.amount);
  }
  return Array.from(sums.entries()).map(([name, value]) => ({ name, value }));
}

export async function getMonthlyTotals(lastN: number = 6): Promise<MonthlyTotals[]> {
  const all = await db.transactions.toArray();
  const end = dayjs().endOf("month");
  const start = end.subtract(lastN - 1, "month").startOf("month");

  const months: string[] = [];
  for (let i = 0; i < lastN; i++) {
    months.push(start.add(i, "month").startOf("month").toISOString());
  }

  const map = new Map<string, { income: number; expense: number }>();
  months.forEach((m) => map.set(m, { income: 0, expense: 0 }));

  for (const tx of all) {
    const txDate = dayjs(tx.date);
    const txMonthStart = txDate.startOf("month").toISOString();
    if (!map.has(txMonthStart)) continue;
    const bucket = map.get(txMonthStart)!;
    if (tx.type === "income") bucket.income += tx.amount;
    else bucket.expense += tx.amount;
  }

  return months.map((m) => ({ month: m, income: map.get(m)!.income, expense: map.get(m)!.expense }));
}

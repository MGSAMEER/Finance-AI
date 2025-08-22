"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { MonthlyTotals } from "@/lib/analytics";
import dayjs from "dayjs";
import { inr } from "@/lib/utils";

function formatMonth(iso: string) {
  return dayjs(iso).format("MMM YY");
}

function abbreviateINR(value: number) {
  // Simple abbreviation for y-axis: thousands -> K, lakhs/crores not needed for seed values
  if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(0)}K`;
  return `₹${value}`;
}

export function IncomeVsExpenseBar({ data }: { data: MonthlyTotals[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tickFormatter={formatMonth} />
        <YAxis tickFormatter={abbreviateINR} />
        <Tooltip formatter={(v: number) => inr(v)} labelFormatter={(l) => formatMonth(l as string)} />
        <Legend />
        <Bar dataKey="income" fill="#10b981" name="Income" />
        <Bar dataKey="expense" fill="#ef4444" name="Expense" />
      </BarChart>
    </ResponsiveContainer>
  );
}

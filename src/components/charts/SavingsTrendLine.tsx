"use client";

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import type { MonthlyTotals } from "@/lib/analytics";
import dayjs from "dayjs";
import { inr } from "@/lib/utils";

function formatMonth(iso: string) {
  return dayjs(iso).format("MMM YY");
}

function abbreviateINR(value: number) {
  if (value >= 1_000_000) return `₹${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `₹${(value / 1_000).toFixed(0)}K`;
  return `₹${value}`;
}

export function SavingsTrendLine({ data }: { data: MonthlyTotals[] }) {
  const series = data.map((d) => ({ month: d.month, savings: d.income - d.expense }));
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={series} margin={{ left: 8, right: 8, top: 8, bottom: 8 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="month" tickFormatter={formatMonth} />
        <YAxis tickFormatter={abbreviateINR} />
        <Tooltip formatter={(v: number) => inr(v)} labelFormatter={(l) => formatMonth(l as string)} />
        <Line type="monotone" dataKey="savings" stroke="#3b82f6" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

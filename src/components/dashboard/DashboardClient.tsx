"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import dynamic from "next/dynamic";
import { db } from "@/lib/db";
import { inr, uid } from "@/lib/utils";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImportCsvDialog } from "@/components/import/ImportCsvDialog";
import { GlobalSearch } from "@/components/search/GlobalSearch";
import { FiltersBar } from "@/components/transactions/FiltersBar";
import { TransactionsList } from "@/components/transactions/TransactionsList";
import dayjs from "dayjs";
import { Transaction, Category, TxType } from "@/lib/types";
import { getCategorySumsForCurrentMonth, getMonthlyTotals, type CategorySum, type MonthlyTotals } from "@/lib/analytics";
import { useTranslation } from "react-i18next";

const ExpensesPie = dynamic(() => import("@/components/charts/ExpensesPie").then(m => m.ExpensesPie), { ssr: false });
const IncomeVsExpenseBar = dynamic(() => import("@/components/charts/IncomeVsExpenseBar").then(m => m.IncomeVsExpenseBar), { ssr: false });
const SavingsTrendLine = dynamic(() => import("@/components/charts/SavingsTrendLine").then(m => m.SavingsTrendLine), { ssr: false });
const ExpensesTrendLine = dynamic(() => import("@/components/charts/ExpensesTrendLine").then(m => m.ExpensesTrendLine), { ssr: false });

interface Totals {
  income: number;
  expenses: number;
}

interface FilterState {
  dateFrom: string;
  dateTo: string;
  categories: Category[];
  types: TxType[];
}

async function seedIfEmpty() {
  const count = await db.transactions.count();
  if (count > 0) return;
  const start = dayjs().startOf("month");
  const samples: Transaction[] = [
    { id: uid(), type: "income", amount: 50000, category: "Other", date: start.add(1, "day").toISOString(), note: "Salary" },
    { id: uid(), type: "expense", amount: 1200, category: "Food", date: start.add(2, "day").toISOString(), note: "Lunch" },
    { id: uid(), type: "expense", amount: 2500, category: "Groceries", date: start.add(3, "day").toISOString(), note: "Grocery" },
    { id: uid(), type: "income", amount: 5000, category: "Other", date: start.add(5, "day").toISOString(), note: "Freelance" },
    { id: uid(), type: "expense", amount: 3000, category: "Travel", date: start.add(6, "day").toISOString(), note: "Cab" },
  ];
  await db.transactions.bulkAdd(samples);
}

export function DashboardClient() {
  const [loading, setLoading] = useState(true);
  const [totals, setTotals] = useState<Totals>({ income: 0, expenses: 0 });
  const [categorySums, setCategorySums] = useState<CategorySum[]>([]);
  const [monthlyTotals, setMonthlyTotals] = useState<MonthlyTotals[]>([]);
  
  // Search and filter state
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [searchResults, setSearchResults] = useState<Transaction[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterState>({
    dateFrom: "",
    dateTo: "",
    categories: [],
    types: [],
  });
  const { t } = useTranslation("common");

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      await seedIfEmpty();
      
      // Load all transactions
      const all = await db.transactions.toArray();
      if (mounted) {
        setAllTransactions(all);
        setSearchResults(all);
      }
      
      // KPIs
      const startMonth = dayjs().startOf("month");
      const endMonth = dayjs().endOf("month");
      const month = all.filter((t) => {
        const d = dayjs(t.date);
        return d.isAfter(startMonth.subtract(1, "ms")) && d.isBefore(endMonth.add(1, "ms"));
      });
      const income = month.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
      const expenses = month.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
      if (mounted) setTotals({ income, expenses });

      // Charts data
      const [cats, months] = await Promise.all([
        getCategorySumsForCurrentMonth(),
        getMonthlyTotals(6),
      ]);
      if (mounted) {
        setCategorySums(cats);
        setMonthlyTotals(months);
      }
      setLoading(false);
    };
    load();
    return () => { mounted = false; };
  }, []);

  // Apply filters to search results
  const filteredTransactions = useMemo(() => {
    let filtered = searchResults;
    if (filters.dateFrom) filtered = filtered.filter(tx => dayjs(tx.date).isAfter(dayjs(filters.dateFrom).subtract(1, 'day')));
    if (filters.dateTo) filtered = filtered.filter(tx => dayjs(tx.date).isBefore(dayjs(filters.dateTo).add(1, 'day')));
    if (filters.categories.length > 0) filtered = filtered.filter(tx => filters.categories.includes(tx.category));
    if (filters.types.length > 0) filtered = filtered.filter(tx => filters.types.includes(tx.type));
    return filtered;
  }, [searchResults, filters]);

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.dateFrom) count++;
    if (filters.dateTo) count++;
    count += filters.categories.length;
    count += filters.types.length;
    return count;
  }, [filters]);

  // Handlers
  const handleSearchResults = useCallback((results: Transaction[]) => setSearchResults(results), []);
  const handleSearchChange = useCallback((term: string) => setSearchTerm(term), []);
  const handleFiltersChange = useCallback((newFilters: FilterState) => setFilters(newFilters), []);
  const handleClearAllFilters = useCallback(() => {
    setFilters({ dateFrom: "", dateTo: "", categories: [], types: [] });
    setSearchTerm("");
    setSearchResults(allTransactions);
  }, [allTransactions]);

  const savings = useMemo(() => totals.income - totals.expenses, [totals]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">{t('nav.dashboard')}</h1>
        <ImportCsvDialog />
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard title={t('kpi.income')} value={inr(totals.income)} loading={loading} />
        <KpiCard title={t('kpi.expenses')} value={inr(totals.expenses)} loading={loading} />
        <KpiCard title={t('kpi.savings')} value={inr(savings)} loading={loading} className="col-span-2 lg:col-span-1" />
        <div className="hidden lg:block" />
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
        <Card className="h-64 md:h-72 lg:h-80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base">{t('charts.spendingByCategory')}</CardTitle>
          </CardHeader>
          <CardContent className="h-[180px] md:h-[220px] lg:h-[260px] p-2">
            {!loading && categorySums.length > 0 ? (
              <ExpensesPie data={categorySums} />
            ) : (
              <div className="h-full rounded-md bg-muted/30 animate-pulse" />
            )}
          </CardContent>
        </Card>
        <Card className="h-64 md:h-72 lg:h-80">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm md:text-base">{t('charts.incomeVsExpense')}</CardTitle>
          </CardHeader>
          <CardContent className="h-[180px] md:h-[220px] lg:h-[260px] p-2">
            {!loading && monthlyTotals.length > 0 ? (
              <IncomeVsExpenseBar data={monthlyTotals} />
            ) : (
              <div className="h-full rounded-md bg-muted/30 animate-pulse" />
            )}
          </CardContent>
        </Card>
        <Card className="h-64">
          <CardHeader>
            <CardTitle>{t('charts.expensesOverTime')}</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            {!loading && monthlyTotals.length > 0 ? (
              <ExpensesTrendLine data={monthlyTotals} />
            ) : (
              <div className="h-full rounded-md bg-muted/30 animate-pulse" />
            )}
          </CardContent>
        </Card>
        <Card className="h-64">
          <CardHeader>
            <CardTitle>{t('charts.savingsTrend')}</CardTitle>
          </CardHeader>
          <CardContent className="h-[200px]">
            {!loading && monthlyTotals.length > 0 ? (
              <SavingsTrendLine data={monthlyTotals} />
            ) : (
              <div className="h-full rounded-md bg-muted/30 animate-pulse" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter Section */}
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <div className="md:col-span-2">
            <GlobalSearch
              transactions={allTransactions}
              onResults={handleSearchResults}
              searchTerm={searchTerm}
              onSearchChange={handleSearchChange}
            />
          </div>
          <div>
            <FiltersBar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onClearAll={handleClearAllFilters}
              activeFiltersCount={activeFiltersCount}
            />
          </div>
        </div>

        <TransactionsList
          transactions={filteredTransactions}
          loading={loading}
          searchTerm={searchTerm}
          emptyMessage={
            searchTerm || activeFiltersCount > 0 
              ? "No transactions match your search and filters" 
              : "No transactions found"
          }
        />
      </div>
    </div>
  );
}

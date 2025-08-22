"use client";

import { useEffect, useState, useCallback } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { BudgetCard } from "@/components/budgets/BudgetCard";
import { CreateBudgetDialog } from "@/components/budgets/CreateBudgetDialog";
import { Budget } from "@/lib/types";
import { getAllBudgets, updateBudgetSpending, deleteBudget, updateBudget } from "@/lib/budgets";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle, TrendingUp, TrendingDown, DollarSign } from "lucide-react";
import { inr } from "@/lib/utils";

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadBudgets = useCallback(async () => {
    try {
      await updateBudgetSpending();
      const allBudgets = await getAllBudgets();
      setBudgets(allBudgets);
    } catch (error) {
      console.error("Error loading budgets:", error);
      toast({
        title: "Error",
        description: "Failed to load budgets",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadBudgets();
  }, [loadBudgets]);

  const handleDeleteBudget = async (budgetId: string) => {
    try {
      await deleteBudget(budgetId);
      toast({
        title: "Budget Deleted",
        description: "Budget has been deleted successfully.",
      });
      loadBudgets();
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete budget",
        variant: "destructive",
      });
    }
  };

  const handleEditBudget = (budget: Budget) => {
    // For now, we'll just show a simple prompt
    // In a real app, you'd want a proper edit dialog
    const newLimit = prompt(`Enter new monthly limit for ${budget.category}:`, budget.monthlyLimit.toString());
    if (newLimit && !isNaN(Number(newLimit))) {
      updateBudgetLimit(budget.id, Number(newLimit));
    }
  };

  const updateBudgetLimit = async (budgetId: string, newLimit: number) => {
    try {
      await updateBudget(budgetId, newLimit);
      toast({
        title: "Budget Updated",
        description: "Budget limit has been updated successfully.",
      });
      loadBudgets();
    } catch {
      toast({
        title: "Error",
        description: "Failed to update budget",
        variant: "destructive",
      });
    }
  };

  const existingCategories = budgets.map(budget => budget.category);
  
  const totalBudget = budgets.reduce((sum, budget) => sum + budget.monthlyLimit, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = budgets.reduce((sum, budget) => sum + budget.remaining, 0);
  
  const budgetsOnTrack = budgets.filter(b => b.status === "safe").length;
  const budgetsWarning = budgets.filter(b => b.status === "warning").length;
  const budgetsExceeded = budgets.filter(b => b.status === "exceeded").length;

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Budgets</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Budget Management</h1>
          <p className="text-muted-foreground">
            Track your spending against monthly budgets for each category.
          </p>
        </div>
        <CreateBudgetDialog 
          onBudgetCreated={loadBudgets} 
          existingCategories={existingCategories}
        />
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inr(totalBudget)}</div>
            <p className="text-xs text-muted-foreground">
              Monthly allocation
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{inr(totalSpent)}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Remaining</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalRemaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {inr(totalRemaining)}
            </div>
            <p className="text-xs text-muted-foreground">
              Available to spend
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 flex-wrap">
              {budgetsOnTrack > 0 && (
                <Badge variant="default" className="text-xs">
                  {budgetsOnTrack} On Track
                </Badge>
              )}
              {budgetsWarning > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {budgetsWarning} Warning
                </Badge>
              )}
              {budgetsExceeded > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {budgetsExceeded} Exceeded
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Cards */}
      {budgets.length === 0 ? (
        <Card>
          <CardContent className="p-6 text-center">
            <div className="text-muted-foreground mb-4">
              <DollarSign className="mx-auto h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No Budgets Created</h3>
              <p>Create your first budget to start tracking your spending against monthly limits.</p>
            </div>
            <CreateBudgetDialog 
              onBudgetCreated={loadBudgets} 
              existingCategories={existingCategories}
            />
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget) => (
            <BudgetCard
              key={budget.id}
              budget={budget}
              onEdit={handleEditBudget}
              onDelete={handleDeleteBudget}
            />
          ))}
        </div>
      )}

      {/* Alerts */}
      {(budgetsWarning > 0 || budgetsExceeded > 0) && (
        <Card className="border-yellow-200 dark:border-yellow-800">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
              <AlertTriangle className="h-5 w-5" />
              Budget Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {budgetsExceeded > 0 && (
                <div className="text-red-600 dark:text-red-400">
                  ⚠️ {budgetsExceeded} budget{budgetsExceeded > 1 ? 's' : ''} exceeded this month
                </div>
              )}
              {budgetsWarning > 0 && (
                <div className="text-yellow-600 dark:text-yellow-400">
                  ⚠️ {budgetsWarning} budget{budgetsWarning > 1 ? 's' : ''} approaching limit
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

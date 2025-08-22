"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreVertical, Edit, Trash2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Budget } from "@/lib/types";
import { inr } from "@/lib/utils";

interface BudgetCardProps {
  budget: Budget;
  onEdit: (budget: Budget) => void;
  onDelete: (budgetId: string) => void;
}

export function BudgetCard({ budget, onEdit, onDelete }: BudgetCardProps) {
  const getStatusColor = (status: Budget["status"]) => {
    switch (status) {
      case "safe":
        return "bg-green-500";
      case "warning":
        return "bg-yellow-500";
      case "exceeded":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusVariant = (status: Budget["status"]) => {
    switch (status) {
      case "safe":
        return "default";
      case "warning":
        return "secondary";
      case "exceeded":
        return "destructive";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: Budget["status"]) => {
    switch (status) {
      case "safe":
        return "On Track";
      case "warning":
        return "Warning";
      case "exceeded":
        return "Over Budget";
      default:
        return "Unknown";
    }
  };

  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-lg font-medium">{budget.category}</CardTitle>
        <div className="flex items-center gap-2">
          <Badge variant={getStatusVariant(budget.status)}>
            {getStatusText(budget.status)}
          </Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(budget)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit Budget
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onDelete(budget.id)}
                className="text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Budget
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Spent</span>
            <span className="font-medium">{inr(budget.spent)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Budget</span>
            <span className="font-medium">{inr(budget.monthlyLimit)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Remaining</span>
            <span className={`font-medium ${budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
              {inr(budget.remaining)}
            </span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Progress</span>
            <span>{budget.percentage.toFixed(1)}%</span>
          </div>
          <Progress 
            value={Math.min(100, budget.percentage)} 
            className="h-2"
            style={{
              backgroundColor: budget.status === "exceeded" ? "#fef2f2" : undefined,
            }}
          />
          <div 
            className={`h-2 rounded-full ${getStatusColor(budget.status)}`}
            style={{
              width: `${Math.min(100, budget.percentage)}%`,
              marginTop: "-8px",
              position: "relative",
            }}
          />
        </div>
        
        {budget.status === "exceeded" && (
          <div className="text-xs text-red-600 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            You&apos;ve exceeded your budget by {inr(budget.spent - budget.monthlyLimit)}
          </div>
        )}
        
        {budget.status === "warning" && (
          <div className="text-xs text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20 p-2 rounded">
            You&apos;re approaching your budget limit
          </div>
        )}
      </CardContent>
    </Card>
  );
}

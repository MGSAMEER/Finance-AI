"use client";

import { useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowUpRight, ArrowDownLeft, Receipt } from "lucide-react";
import { inr } from "@/lib/utils";
import type { Transaction } from "@/lib/types";
import dayjs from "dayjs";

interface TransactionsListProps {
  transactions: Transaction[];
  loading?: boolean;
  searchTerm?: string;
  emptyMessage?: string;
}

export function TransactionsList({ 
  transactions, 
  loading = false, 
  searchTerm = "",
  emptyMessage = "No transactions found"
}: TransactionsListProps) {
  
  const groupedTransactions = useMemo(() => {
    const groups: Record<string, Transaction[]> = {};
    
    transactions.forEach(tx => {
      const date = dayjs(tx.date).format("YYYY-MM-DD");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(tx);
    });

    // Sort dates descending and transactions within each date by amount
    const sortedGroups = Object.entries(groups)
      .sort(([a], [b]) => dayjs(b).diff(dayjs(a)))
      .map(([date, txs]) => [
        date, 
        txs.sort((a, b) => b.amount - a.amount)
      ] as [string, Transaction[]]);

    return sortedGroups;
  }, [transactions]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>Your recent transactions</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="space-y-2">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transactions</CardTitle>
          <CardDescription>
            {searchTerm ? `Search results for "${searchTerm}"` : "Your recent transactions"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Receipt className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{emptyMessage}</h3>
            <p className="text-muted-foreground">
              {searchTerm 
                ? "Try adjusting your search terms or filters" 
                : "Start by adding your first transaction"
              }
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Transactions</CardTitle>
        <CardDescription>
          {searchTerm ? (
            <>Search results for &quot;{searchTerm}&quot; ({transactions.length} found)</>
          ) : (
            <>Showing {transactions.length} transactions</>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {groupedTransactions.map(([date, dayTransactions]) => (
          <div key={date} className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-muted-foreground">
                {dayjs(date).format("dddd, MMMM D, YYYY")}
              </h4>
              <Badge variant="outline" className="text-xs">
                {dayTransactions.length} transaction{dayTransactions.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="space-y-2">
              {dayTransactions.map((transaction) => (
                <TransactionItem 
                  key={transaction.id} 
                  transaction={transaction}
                  searchTerm={searchTerm}
                />
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

interface TransactionItemProps {
  transaction: Transaction;
  searchTerm?: string;
}

function TransactionItem({ transaction, searchTerm }: TransactionItemProps) {
  const isIncome = transaction.type === "income";
  
  const highlightText = (text: string) => {
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 dark:bg-yellow-800">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
      <div className={`p-2 rounded-full ${
        isIncome 
          ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-400" 
          : "bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-400"
      }`}>
        {isIncome ? (
          <ArrowUpRight className="h-4 w-4" />
        ) : (
          <ArrowDownLeft className="h-4 w-4" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge 
              variant={isIncome ? "default" : "secondary"}
              className="text-xs"
            >
              {highlightText(transaction.category)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {highlightText(transaction.type)}
            </Badge>
          </div>
          <div className={`text-sm font-semibold ${
            isIncome ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
          }`}>
            {isIncome ? "+" : "-"}{inr(transaction.amount)}
          </div>
        </div>
        
        {transaction.note && (
          <p className="text-sm text-muted-foreground mt-1 truncate">
            {highlightText(transaction.note)}
          </p>
        )}
        
        <p className="text-xs text-muted-foreground mt-1">
          {dayjs(transaction.date).format("h:mm A")}
        </p>
      </div>
    </div>
  );
}

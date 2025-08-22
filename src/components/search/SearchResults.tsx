"use client";

import { useSearch } from "@/stores/useSearch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { inr } from "@/lib/utils";
import dayjs from "dayjs";

export function SearchResults() {
  const { query, results, isOpen, close } = useSearch();

  if (!isOpen || !query.trim()) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/50" onClick={close}>
      <div className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4">
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Search Results
              <Badge variant="secondary">{results.length} found</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {results.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No transactions found for &quot;{query}&quot;
              </p>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {results.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{transaction.note || transaction.category}</div>
                      <div className="text-sm text-muted-foreground">
                        {transaction.category} • {dayjs(transaction.date).format("MMM D, YYYY")}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={transaction.type === "income" ? "text-green-600" : "text-red-600"}>
                        {transaction.type === "income" ? "+" : "-"}{inr(transaction.amount)}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {transaction.type}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

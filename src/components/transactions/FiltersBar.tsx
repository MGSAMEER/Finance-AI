"use client";

import { useState } from "react";
import { Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent } from "@/components/ui/card";
import type { Category, TxType } from "@/lib/types";
import dayjs from "dayjs";

interface FilterState {
  dateFrom: string;
  dateTo: string;
  categories: Category[];
  types: TxType[];
}

interface FiltersBarProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  onClearAll: () => void;
  activeFiltersCount: number;
}

const categories: Category[] = [
  "Food", "Travel", "Rent", "Shopping", "Bills", 
  "Health", "Entertainment", "Groceries", "Other"
];

const types: { value: TxType; label: string }[] = [
  { value: "income", label: "Income" },
  { value: "expense", label: "Expense" },
];

export function FiltersBar({ filters, onFiltersChange, onClearAll, activeFiltersCount }: FiltersBarProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilters = (updates: Partial<FilterState>) => {
    onFiltersChange({ ...filters, ...updates });
  };

  const toggleCategory = (category: Category) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    updateFilters({ categories: newCategories });
  };

  const toggleType = (type: TxType) => {
    const newTypes = filters.types.includes(type)
      ? filters.types.filter(t => t !== type)
      : [...filters.types, type];
    updateFilters({ types: newTypes });
  };

  const setDateRange = (range: "today" | "week" | "month" | "year") => {
    const now = dayjs();
    let dateFrom = "";
    const dateTo = now.format("YYYY-MM-DD");

    switch (range) {
      case "today":
        dateFrom = now.format("YYYY-MM-DD");
        break;
      case "week":
        dateFrom = now.startOf("week").format("YYYY-MM-DD");
        break;
      case "month":
        dateFrom = now.startOf("month").format("YYYY-MM-DD");
        break;
      case "year":
        dateFrom = now.startOf("year").format("YYYY-MM-DD");
        break;
    }

    updateFilters({ dateFrom, dateTo });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm">
              <Filter className="mr-2 h-4 w-4" />
              Filters
              {activeFiltersCount > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {activeFiltersCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-80">
            <Card>
              <CardContent className="p-4 space-y-4">
                {/* Date Range */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Date Range</Label>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label htmlFor="date-from" className="text-xs text-muted-foreground">From</Label>
                      <Input
                        id="date-from"
                        type="date"
                        value={filters.dateFrom}
                        onChange={(e) => updateFilters({ dateFrom: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                    <div>
                      <Label htmlFor="date-to" className="text-xs text-muted-foreground">To</Label>
                      <Input
                        id="date-to"
                        type="date"
                        value={filters.dateTo}
                        onChange={(e) => updateFilters({ dateTo: e.target.value })}
                        className="text-xs"
                      />
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap">
                    <Button variant="outline" size="sm" onClick={() => setDateRange("today")} className="text-xs">
                      Today
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDateRange("week")} className="text-xs">
                      This Week
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDateRange("month")} className="text-xs">
                      This Month
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => setDateRange("year")} className="text-xs">
                      This Year
                    </Button>
                  </div>
                </div>

                {/* Categories */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Categories</Label>
                  <div className="max-h-32 overflow-y-auto">
                    {categories.map((category) => (
                      <DropdownMenuCheckboxItem
                        key={category}
                        checked={filters.categories.includes(category)}
                        onCheckedChange={() => toggleCategory(category)}
                        className="text-xs"
                      >
                        {category}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                </div>

                {/* Transaction Types */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Transaction Type</Label>
                  <div className="space-y-1">
                    {types.map((type) => (
                      <DropdownMenuCheckboxItem
                        key={type.value}
                        checked={filters.types.includes(type.value)}
                        onCheckedChange={() => toggleType(type.value)}
                        className="text-xs"
                      >
                        {type.label}
                      </DropdownMenuCheckboxItem>
                    ))}
                  </div>
                </div>

                {/* Clear All */}
                {activeFiltersCount > 0 && (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={onClearAll}
                    className="w-full text-xs"
                  >
                    <X className="mr-2 h-3 w-3" />
                    Clear All Filters
                  </Button>
                )}
              </CardContent>
            </Card>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Active filter badges */}
        <div className="flex gap-1 flex-wrap">
          {filters.dateFrom && (
            <Badge variant="secondary" className="text-xs">
              From: {dayjs(filters.dateFrom).format("MMM DD")}
            </Badge>
          )}
          {filters.dateTo && (
            <Badge variant="secondary" className="text-xs">
              To: {dayjs(filters.dateTo).format("MMM DD")}
            </Badge>
          )}
          {filters.categories.map((category) => (
            <Badge key={category} variant="secondary" className="text-xs">
              {category}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleCategory(category)}
                className="ml-1 h-3 w-3 p-0"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
          {filters.types.map((type) => (
            <Badge key={type} variant="secondary" className="text-xs">
              {type}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => toggleType(type)}
                className="ml-1 h-3 w-3 p-0"
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

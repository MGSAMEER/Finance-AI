"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearch } from "@/stores/useSearch";
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { inr } from "@/lib/utils";
import dayjs from "dayjs";
import { 
  Receipt, 
  ShoppingCart, 
  Car, 
  Home, 
  Zap, 
  Heart, 
  Gamepad2,
  Package
} from "lucide-react";
import { Category, Transaction } from "@/lib/types";

// Category icons mapping
const categoryIcons: Record<Category, React.ComponentType<{ className?: string }>> = {
  Food: Receipt,
  Travel: Car,
  Rent: Home,
  Shopping: ShoppingCart,
  Bills: Zap,
  Health: Heart,
  Entertainment: Gamepad2,
  Groceries: Package,
  Other: Receipt,
};

interface SearchDropdownProps {
  children: React.ReactNode;
}

export function SearchDropdown({ children }: SearchDropdownProps) {
  const { query, results, isOpen, close } = useSearch();
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  // Show dropdown when search is active and query is long enough
  const shouldShowDropdown = isOpen && query.length >= 2;

  // Reset selected index when results change
  useEffect(() => {
    setSelectedIndex(0);
  }, [results]);

  // Update popover state based on search state
  useEffect(() => {
    setIsPopoverOpen(shouldShowDropdown);
  }, [shouldShowDropdown]);

  const handleSelectTransaction = useCallback((transaction: Transaction) => {
    console.log('Selected transaction:', transaction);
    // TODO: Navigate to transaction detail or highlight in list
    close();
  }, [close]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!shouldShowDropdown || results.length === 0) return;

      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % results.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + results.length) % results.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (results[selectedIndex]) {
            handleSelectTransaction(results[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          close();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [shouldShowDropdown, results, selectedIndex, close, handleSelectTransaction]);

  const getTransactionIcon = (transaction: Transaction) => {
    const IconComponent = categoryIcons[transaction.category];
    return IconComponent;
  };

  return (
    <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-[400px] p-0" 
        align="start"
        side="bottom"
        sideOffset={4}
      >
        <Command className="rounded-lg border shadow-md">
          <CommandList>
            {results.length === 0 ? (
              <CommandEmpty>
                No results for &quot;{query}&quot;
              </CommandEmpty>
            ) : (
              <CommandGroup>
                {results.map((transaction, index) => {
                  const IconComponent = getTransactionIcon(transaction);
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <CommandItem
                      key={transaction.id}
                      value={transaction.id}
                      onSelect={() => handleSelectTransaction(transaction)}
                      className={`flex items-center justify-between p-3 cursor-pointer ${
                        isSelected ? 'bg-accent' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <div className="flex-shrink-0">
                          <IconComponent className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {transaction.note || transaction.category}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span>{transaction.category}</span>
                            <span>•</span>
                            <span>{dayjs(transaction.date).format("MMM D, YYYY")}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div className={`text-sm font-medium ${
                          transaction.type === "income" ? "text-green-600" : "text-red-600"
                        }`}>
                          {transaction.type === "income" ? "+" : "-"}{inr(transaction.amount)}
                        </div>
                        <Badge 
                          variant="outline" 
                          className="text-xs"
                        >
                          {transaction.type}
                        </Badge>
                      </div>
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

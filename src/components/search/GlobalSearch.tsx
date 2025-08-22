"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Fuse, { IFuseOptions } from "fuse.js";
import debounce from "lodash.debounce";
import type { Transaction } from "@/lib/types";

interface GlobalSearchProps {
  transactions: Transaction[];
  onResults: (results: Transaction[]) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
}

const fuseOptions: IFuseOptions<Transaction> = {
  keys: [
    { name: "note", weight: 0.4 },
    { name: "category", weight: 0.3 },
    { name: "type", weight: 0.2 },
    { name: "amount", weight: 0.1, getFn: (tx) => tx.amount.toString() },
  ],
  threshold: 0.3, // Lower = more strict matching
  includeScore: true,
  includeMatches: true,
  minMatchCharLength: 2,
};

export function GlobalSearch({ transactions, onResults, searchTerm, onSearchChange }: GlobalSearchProps) {
  const [inputValue, setInputValue] = useState(searchTerm);

  const fuse = useMemo(() => new Fuse(transactions, fuseOptions), [transactions]);

  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      onSearchChange(term);
      if (!term.trim()) {
        onResults(transactions);
      } else {
        const results = fuse.search(term);
        onResults(results.map(result => result.item));
      }
    }, 250),
    [fuse, onResults, onSearchChange, transactions]
  );

  useEffect(() => {
    debouncedSearch(inputValue);
    return () => debouncedSearch.cancel();
  }, [inputValue, debouncedSearch]);

  useEffect(() => {
    setInputValue(searchTerm);
  }, [searchTerm]);

  const handleClear = () => {
    setInputValue("");
    onSearchChange("");
    onResults(transactions);
  };

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input
        type="text"
        placeholder="Search transactions, notes, categories..."
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        className="pl-10 pr-10"
      />
      {inputValue && (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleClear}
          className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
}

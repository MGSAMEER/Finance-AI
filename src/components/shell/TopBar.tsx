"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearch } from "@/stores/useSearch";
import debounce from "lodash.debounce";
import { SearchResults } from "@/components/search/SearchResults";
import { SearchDropdown } from "@/components/search/SearchDropdown";
import { NotificationsBell } from "@/components/notifications/NotificationsBell";
import { searchTransactions, initializeSearchIndex } from "@/lib/search";
import ThemeToggle from "@/components/theme-toggle";
import { UserButton, SignedIn, SignedOut, SignInButton } from '@clerk/nextjs';
import { supportedLanguages } from "@/lib/i18n";
import { useTranslation } from "react-i18next";

interface TopBarProps {
  className?: string;
}

export function TopBar({ className }: TopBarProps) {
  const { i18n } = useTranslation();
  const [language, setLanguage] = useState(i18n.language || "en");
  
  // Search store
  const { query, setQuery, setResults, clear, open } = useSearch();
  
  // Update language state when i18n language changes
  useEffect(() => {
    setLanguage(i18n.language || "en");
  }, [i18n.language]);
  
  // Debounced search function
  const debouncedSetQuery = useMemo(
    () => debounce(async (value: string) => {
      setQuery(value);
      
      // Perform search if query is long enough
      if (value.trim().length >= 2) {
        try {
          const results = await searchTransactions(value);
          setResults(results);
        } catch (error) {
          console.error('Search failed:', error);
          setResults([]);
        }
      } else {
        setResults([]);
      }
    }, 250),
    [setQuery, setResults]
  );
  
  // Initialize search index on mount
  useEffect(() => {
    initializeSearchIndex();
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Focus search on "/" key (when not typing in input)
      if (e.key === '/' && !(e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement)) {
        e.preventDefault();
        const searchInput = document.querySelector('input[placeholder*="Search"]') as HTMLInputElement;
        if (searchInput) {
          searchInput.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const changeLanguage = async (lng: string) => {
    await i18n.changeLanguage(lng);
    setLanguage(lng);
    localStorage.setItem("i18nextLng", lng);
  };

  const handleSearch = async (searchQuery: string) => {
    console.log("Searching for:", searchQuery);
    if (searchQuery.trim().length >= 2) {
      try {
        const results = await searchTransactions(searchQuery);
        setResults(results);
        open(); // Open search results modal
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
      }
    }
  };

  return (
    <header className={cn("sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="flex h-16 items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Mobile Menu Button - Only visible on mobile */}
        <div className="lg:hidden">
          {/* This will be handled by the AppSidebar component */}
        </div>

        {/* App Title - Hidden on mobile when sidebar is open */}
        <div className="flex items-center gap-2 lg:flex-1">
          <h1 className="text-lg font-semibold text-foreground">Finance AI</h1>
          <Badge variant="secondary" className="hidden sm:inline-flex">
            Beta
          </Badge>
        </div>

        {/* Search Bar */}
        <div className="flex-1 max-w-md mx-4 pointer-events-auto">
          <SearchDropdown>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search transaction/Reports(Search By Category)"
                className="pl-10 bg-muted/50 border-0 focus-visible:ring-2 focus-visible:ring-ring pointer-events-auto"
                value={query}
                onChange={(e) => {
                  const value = e.target.value;
                  debouncedSetQuery(value);
                }}
                onFocus={(e) => e.target.select()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(query);
                  } else if (e.key === 'Escape') {
                    clear();
                    e.currentTarget.blur();
                  } else if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                    e.preventDefault();
                    open();
                  }
                }}
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 pointer-events-auto"
                  onClick={() => clear()}
                >
                  <span className="sr-only">Clear search</span>
                  ×
                </Button>
              )}
            </div>
          </SearchDropdown>
        </div>

        {/* Right Side Actions */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Notifications */}
          <NotificationsBell />

          {/* Language Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="pointer-events-auto">
                <Globe className="h-5 w-5" />
                <span className="sr-only">Select language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {supportedLanguages.map((lng) => (
                <DropdownMenuItem 
                  key={lng.code} 
                  onClick={() => changeLanguage(lng.code)}
                  className={language === lng.code ? "bg-accent" : ""}
                >
                  {lng.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Authentication */}
          <SignedOut>
            <SignInButton />
          </SignedOut>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
      
      {/* Search Results Modal */}
      <SearchResults />
    </header>
  );
}

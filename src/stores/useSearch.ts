import { create } from 'zustand';
import { Transaction } from '@/lib/types';

interface SearchState {
  query: string;
  results: Transaction[];
  isOpen: boolean;
}

interface SearchActions {
  setQuery: (query: string) => void;
  setResults: (results: Transaction[]) => void;
  open: () => void;
  close: () => void;
  clear: () => void;
}

type SearchStore = SearchState & SearchActions;

export const useSearch = create<SearchStore>((set) => ({
  // State
  query: '',
  results: [],
  isOpen: false,

  // Actions
  setQuery: (query: string) => set({ query }),
  setResults: (results: Transaction[]) => set({ results }),
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  clear: () => set({ query: '', results: [], isOpen: false }),
}));

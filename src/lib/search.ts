import Fuse from 'fuse.js';
import type { IFuseOptions } from 'fuse.js';
import { Transaction } from './types';
import { db } from './db';
import debounce from 'lodash.debounce';

// Interface for searchable transactions (with string amounts for better search)
interface SearchableTransaction extends Omit<Transaction, 'amount'> {
  amount: string;
  dateFormatted: string;
}

// Fuse.js options for better search results
const fuseOptions: IFuseOptions<SearchableTransaction> = {
  keys: [
    { name: 'note', weight: 0.4 },
    { name: 'category', weight: 0.3 },
    { name: 'type', weight: 0.2 },
    { name: 'amount', weight: 0.1 },
    { name: 'dateFormatted', weight: 0.1 }
  ],
  threshold: 0.3, // Lower threshold = more strict matching
  includeScore: true,
  minMatchCharLength: 2,
  shouldSort: true,
  findAllMatches: false,
  location: 0,
  distance: 100,
  useExtendedSearch: false,
  ignoreLocation: false,
  ignoreFieldNorm: false,
};

let fuseIndex: Fuse<SearchableTransaction> | null = null;
let lastTransactionCount = 0;

// Debounced function to rebuild the search index
const rebuildIndexDebounced = debounce(async () => {
  try {
    const transactions = await db.transactions.toArray();
    
    // Only rebuild if transaction count changed
    if (transactions.length !== lastTransactionCount) {
      lastTransactionCount = transactions.length;
      
      // Transform transactions for better search (convert amount to string)
      const searchableTransactions: SearchableTransaction[] = transactions.map(tx => ({
        ...tx,
        amount: tx.amount.toString(),
        dateFormatted: new Date(tx.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      }));
      
      fuseIndex = new Fuse(searchableTransactions, fuseOptions);
      console.log(`Search index rebuilt with ${transactions.length} transactions`);
    }
  } catch (error) {
    console.error('Error rebuilding search index:', error);
  }
}, 500);

// Initialize the search index
export const initializeSearchIndex = async () => {
  await rebuildIndexDebounced();
};

// Search transactions using the Fuse index
export const searchTransactions = async (query: string): Promise<Transaction[]> => {
  if (!query.trim() || query.length < 2) {
    return [];
  }

  try {
    // Ensure index is up to date
    await rebuildIndexDebounced();
    
    if (!fuseIndex) {
      console.warn('Search index not initialized');
      return [];
    }

    // Perform search
    const results = fuseIndex.search(query, {
      limit: 50 // Top 50 results
    });

    // Extract and return original transactions (convert back from searchable format)
    const transactions: Transaction[] = results.map(result => ({
      ...result.item,
      amount: parseFloat(result.item.amount),
      date: result.item.date // Use original date
    }));
    console.log(`Search for "${query}" returned ${transactions.length} results`);
    
    return transactions;
  } catch (error) {
    console.error('Error searching transactions:', error);
    return [];
  }
};

// Force rebuild index (useful for testing)
export const forceRebuildIndex = () => {
  lastTransactionCount = 0;
  rebuildIndexDebounced();
};

// Get current index stats
export const getSearchIndexStats = () => ({
  isInitialized: fuseIndex !== null,
  transactionCount: lastTransactionCount,
  lastRebuild: new Date().toISOString()
});

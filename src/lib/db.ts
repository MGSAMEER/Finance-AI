import Dexie, { Table } from "dexie";
import type { Transaction, Budget, Achievement, UserStats } from "@/lib/types";
import { env } from "@/lib/env";
import dayjs from "dayjs";
import { uid } from "@/lib/utils";
import { initializeAchievements, initializeUserStats } from "@/lib/gamification";

export const DB_NAME = "finance_ai";
export const DB_VERSION = 1; // will be bumped later

// Define stores in one place for hashing and schema
const STORES_DEFINITION = {
  transactions: "id, type, category, date",
  budgets: "id, category, createdAt",
  achievements: "id, type, completed, unlockedAt",
  userStats: "id",
} as const;

// Simple deterministic hash for a string (djb2)
function hashString(input: string): string {
  let hash = 5381;
  for (let i = 0; i < input.length; i++) {
    // hash * 33 + char
    hash = (hash << 5) + hash + input.charCodeAt(i);
    hash |= 0; // 32-bit
  }
  return String(hash);
}

const SCHEMA_HASH = hashString(JSON.stringify(STORES_DEFINITION));
const SCHEMA_HASH_STORAGE_KEY = `${DB_NAME}_schema_hash_v${DB_VERSION}`;

class FinanceDB extends Dexie {
  transactions!: Table<Transaction, string>;
  budgets!: Table<Budget, string>;
  achievements!: Table<Achievement, string>;
  userStats!: Table<UserStats, string>;

  constructor() {
    super(DB_NAME);
    this.version(DB_VERSION).stores({
      // Keep existing schema as-is to avoid breaking data/code paths
      ...STORES_DEFINITION,
    });
  }
}

interface GlobalWithFinanceDB {
  __financeDb?: FinanceDB;
}

const globalAny = globalThis as GlobalWithFinanceDB;

export function getDB(): FinanceDB {
  if (!globalAny.__financeDb) {
    globalAny.__financeDb = new FinanceDB();
  }
  return globalAny.__financeDb as FinanceDB;
}

async function ensureSchemaCompatibility(): Promise<void> {
  // Only runs in browser contexts where IndexedDB/localStorage exist
  if (typeof window === "undefined" || typeof indexedDB === "undefined") return;
  
  // Check if schema reset is enabled via environment variable
  const shouldResetOnSchemaChange = env.DB_RESET_ON_SCHEMA_CHANGE;
  
  try {
    const stored = localStorage.getItem(SCHEMA_HASH_STORAGE_KEY);
    if (stored !== SCHEMA_HASH && shouldResetOnSchemaChange) {
      // Close any existing instance before deleting
      try { globalAny.__financeDb?.close?.(); } catch {}
      await Dexie.delete(DB_NAME);
      localStorage.setItem(SCHEMA_HASH_STORAGE_KEY, SCHEMA_HASH);
      // Recreate a fresh instance after deletion
      globalAny.__financeDb = new FinanceDB();
    }
  } catch {
    // Non-fatal in dev/demo; best-effort guard
  }
}

export async function safeOpen(): Promise<FinanceDB> {
  await ensureSchemaCompatibility();
  const db = getDB();
  try {
    if (!db.isOpen()) {
      await db.open();
    }
  } catch (e) {
    if ((e as Error)?.name === "DatabaseClosedError") {
      try {
        await db.open();
      } catch {
        // swallow re-open error; caller can handle operations failure
      }
    }
  }
  return db;
}

// Backward-compatible default/export used across the app
export const db = getDB();

/**
 * Comprehensive seeding function that creates demo data for all tables
 * This is used both for initial setup and after database reset
 */
export async function seedDemoData(): Promise<void> {
  try {
    // Seed transactions across multiple months for better chart data
    const start = dayjs().startOf("month");
    const sampleTransactions: Transaction[] = [
      // Current month
      { id: uid(), type: "income", amount: 50000, category: "Other", date: start.add(1, "day").toISOString(), note: "Salary" },
      { id: uid(), type: "expense", amount: 1200, category: "Food", date: start.add(2, "day").toISOString(), note: "Lunch" },
      { id: uid(), type: "expense", amount: 2500, category: "Groceries", date: start.add(3, "day").toISOString(), note: "Grocery shopping" },
      { id: uid(), type: "income", amount: 5000, category: "Other", date: start.add(5, "day").toISOString(), note: "Freelance work" },
      { id: uid(), type: "expense", amount: 3000, category: "Travel", date: start.add(6, "day").toISOString(), note: "Cab fare" },
      { id: uid(), type: "expense", amount: 15000, category: "Rent", date: start.add(1, "day").toISOString(), note: "Monthly rent" },
      { id: uid(), type: "expense", amount: 800, category: "Bills", date: start.add(7, "day").toISOString(), note: "Electricity bill" },
      { id: uid(), type: "expense", amount: 2000, category: "Shopping", date: start.add(8, "day").toISOString(), note: "Clothing" },
      { id: uid(), type: "expense", amount: 1500, category: "Health", date: start.add(9, "day").toISOString(), note: "Pharmacy" },
      { id: uid(), type: "expense", amount: 1200, category: "Entertainment", date: start.add(10, "day").toISOString(), note: "Movie tickets" },
      
      // Previous month
      { id: uid(), type: "income", amount: 48000, category: "Other", date: start.subtract(1, "month").add(1, "day").toISOString(), note: "Salary" },
      { id: uid(), type: "expense", amount: 1100, category: "Food", date: start.subtract(1, "month").add(2, "day").toISOString(), note: "Lunch" },
      { id: uid(), type: "expense", amount: 2300, category: "Groceries", date: start.subtract(1, "month").add(3, "day").toISOString(), note: "Grocery shopping" },
      { id: uid(), type: "expense", amount: 14000, category: "Rent", date: start.subtract(1, "month").add(1, "day").toISOString(), note: "Monthly rent" },
      { id: uid(), type: "expense", amount: 1800, category: "Shopping", date: start.subtract(1, "month").add(8, "day").toISOString(), note: "Clothing" },
      
      // Two months ago
      { id: uid(), type: "income", amount: 52000, category: "Other", date: start.subtract(2, "month").add(1, "day").toISOString(), note: "Salary" },
      { id: uid(), type: "expense", amount: 1300, category: "Food", date: start.subtract(2, "month").add(2, "day").toISOString(), note: "Lunch" },
      { id: uid(), type: "expense", amount: 16000, category: "Rent", date: start.subtract(2, "month").add(1, "day").toISOString(), note: "Monthly rent" },
      { id: uid(), type: "expense", amount: 2500, category: "Travel", date: start.subtract(2, "month").add(15, "day").toISOString(), note: "Vacation" },
    ];

    // Seed budgets
    const sampleBudgets: Budget[] = [
      { id: uid(), category: "Food", monthlyLimit: 8000, spent: 3700, remaining: 4300, percentage: 46.25, status: "safe", createdAt: start.toISOString(), updatedAt: start.toISOString() },
      { id: uid(), category: "Travel", monthlyLimit: 5000, spent: 3000, remaining: 2000, percentage: 60, status: "warning", createdAt: start.toISOString(), updatedAt: start.toISOString() },
      { id: uid(), category: "Shopping", monthlyLimit: 3000, spent: 2000, remaining: 1000, percentage: 66.67, status: "warning", createdAt: start.toISOString(), updatedAt: start.toISOString() },
    ];

    // Clear existing data and seed fresh
    await db.transactions.clear();
    await db.budgets.clear();
    await db.achievements.clear();
    await db.userStats.clear();

    // Add new data
    await db.transactions.bulkAdd(sampleTransactions);
    await db.budgets.bulkAdd(sampleBudgets);

    // Initialize achievements and user stats
    await initializeAchievements();
    await initializeUserStats();

    console.log("Demo data seeded successfully");
  } catch (error) {
    console.error("Error seeding demo data:", error);
    throw error;
  }
}

/**
 * Reset database completely and reseed with demo data
 * This function handles the full reset process
 */
export async function resetDatabaseAndSeed(): Promise<void> {
  try {
    // Close any existing database connection
    try { 
      if (globalAny.__financeDb?.isOpen()) {
        await globalAny.__financeDb.close();
      }
    } catch {}

    // Delete the entire database
    await Dexie.delete(DB_NAME);
    
    // Clear the schema hash from localStorage
    localStorage.removeItem(SCHEMA_HASH_STORAGE_KEY);
    
    // Recreate database instance
    globalAny.__financeDb = new FinanceDB();
    
    // Open the new database
    await globalAny.__financeDb.open();
    
    // Seed with demo data
    await seedDemoData();
    
    // Set the new schema hash
    localStorage.setItem(SCHEMA_HASH_STORAGE_KEY, SCHEMA_HASH);
    
    console.log("Database reset and reseeded successfully");
  } catch (error) {
    console.error("Error resetting database:", error);
    throw error;
  }
}

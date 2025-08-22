export type TxType = "expense" | "income";

export type Category =
  | "Food"
  | "Travel"
  | "Rent"
  | "Shopping"
  | "Bills"
  | "Health"
  | "Entertainment"
  | "Groceries"
  | "Other";

export interface Transaction {
  id: string;
  type: TxType;
  amount: number;
  category: Category;
  date: string; // ISO string
  note?: string;
}

export interface Budget {
  id: string;
  category: Category;
  monthlyLimit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: "safe" | "warning" | "exceeded";
  createdAt: string;
  updatedAt: string;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  type: "savings" | "spending" | "streak" | "milestone";
  requirement: number;
  progress: number;
  completed: boolean;
  unlockedAt?: string;
  points: number;
}

export interface UserStats {
  id: string; // primary key for Dexie (e.g., "main")
  totalPoints: number;
  currentStreak: number;
  longestStreak: number;
  financialHealthScore: number;
  totalSavings: number;
  monthlyGoalProgress: number;
  achievementsUnlocked: number;
  level: number;
  nextLevelPoints: number;
}

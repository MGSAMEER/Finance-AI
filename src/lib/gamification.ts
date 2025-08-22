import dayjs from "dayjs";
import { db } from "./db";
import { Achievement, UserStats, Transaction } from "./types";
import { uid } from "./utils";

// Achievement definitions
export const ACHIEVEMENTS: Omit<Achievement, "id" | "progress" | "completed" | "unlockedAt">[] = [
  {
    title: "First Steps",
    description: "Add your first transaction",
    icon: "🚀",
    type: "milestone",
    requirement: 1,
    points: 10,
  },
  {
    title: "Consistent Tracker",
    description: "Add transactions for 7 consecutive days",
    icon: "📈",
    type: "streak",
    requirement: 7,
    points: 50,
  },
  {
    title: "Savings Champion",
    description: "Save ₹10,000 in a month",
    icon: "💰",
    type: "savings",
    requirement: 10000,
    points: 100,
  },
  {
    title: "Budget Master",
    description: "Stay within budget for all categories in a month",
    icon: "🎯",
    type: "spending",
    requirement: 1,
    points: 75,
  },
  {
    title: "Century Club",
    description: "Add 100 transactions",
    icon: "💯",
    type: "milestone",
    requirement: 100,
    points: 150,
  },
  {
    title: "Big Saver",
    description: "Save ₹50,000 in a month",
    icon: "🏆",
    type: "savings",
    requirement: 50000,
    points: 200,
  },
  {
    title: "Streak Master",
    description: "Maintain a 30-day tracking streak",
    icon: "🔥",
    type: "streak",
    requirement: 30,
    points: 300,
  },
  {
    title: "Financial Guru",
    description: "Achieve 90+ financial health score",
    icon: "🧠",
    type: "milestone",
    requirement: 90,
    points: 250,
  },
];

export async function initializeAchievements(): Promise<void> {
  const existingAchievements = await db.achievements.toArray();
  
  if (existingAchievements.length === 0) {
    const achievements: Achievement[] = ACHIEVEMENTS.map(achievement => ({
      ...achievement,
      id: uid(),
      progress: 0,
      completed: false,
    }));

    await db.achievements.bulkAdd(achievements);
  }
}

export async function initializeUserStats(): Promise<UserStats> {
  let userStats = await db.userStats.get("main");
  
  if (!userStats) {
    userStats = {
      id: "main",
      totalPoints: 0,
      currentStreak: 0,
      longestStreak: 0,
      financialHealthScore: 0,
      totalSavings: 0,
      monthlyGoalProgress: 0,
      achievementsUnlocked: 0,
      level: 1,
      nextLevelPoints: 100,
    };
    
    await db.userStats.add(userStats);
  }
  
  return userStats;
}

export async function updateUserStats(): Promise<UserStats> {
  const userStats = await initializeUserStats();
  const transactions = await db.transactions.toArray();
  const achievements = await db.achievements.toArray();
  
  // Calculate current streak
  const currentStreak = await calculateCurrentStreak();
  
  // Calculate financial health score
  const financialHealthScore = await calculateFinancialHealthScore();
  
  // Calculate total savings (current month)
  const startOfMonth = dayjs().startOf("month");
  const endOfMonth = dayjs().endOf("month");
  const monthlyTransactions = transactions.filter(t => {
    const date = dayjs(t.date);
    return date.isAfter(startOfMonth.subtract(1, "ms")) && date.isBefore(endOfMonth.add(1, "ms"));
  });
  
  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
    
  const totalSavings = monthlyIncome - monthlyExpenses;
  
  // Count unlocked achievements
  const achievementsUnlocked = achievements.filter(a => a.completed).length;
  
  // Calculate total points
  const totalPoints = achievements
    .filter(a => a.completed)
    .reduce((sum, a) => sum + a.points, 0);
  
  // Calculate level
  const level = Math.floor(totalPoints / 100) + 1;
  const nextLevelPoints = level * 100;
  
  const updatedStats: UserStats = {
    ...userStats,
    currentStreak,
    longestStreak: Math.max(userStats.longestStreak, currentStreak),
    financialHealthScore,
    totalSavings,
    achievementsUnlocked,
    totalPoints,
    level,
    nextLevelPoints,
    monthlyGoalProgress: Math.min(100, (totalSavings / 20000) * 100), // Assuming ₹20,000 monthly goal
  };
  
  await db.userStats.put(updatedStats);
  return updatedStats;
}

export async function calculateCurrentStreak(): Promise<number> {
  const transactions = await db.transactions.orderBy("date").reverse().toArray();
  if (transactions.length === 0) return 0;
  
  let streak = 0;
  let currentDate = dayjs();
  
  // Group transactions by date
  const transactionsByDate = new Map<string, Transaction[]>();
  transactions.forEach(t => {
    const date = dayjs(t.date).format("YYYY-MM-DD");
    if (!transactionsByDate.has(date)) {
      transactionsByDate.set(date, []);
    }
    transactionsByDate.get(date)!.push(t);
  });
  
  // Calculate streak from today backwards
  while (currentDate.isAfter(dayjs().subtract(365, "days"))) {
    const dateStr = currentDate.format("YYYY-MM-DD");
    if (transactionsByDate.has(dateStr)) {
      streak++;
      currentDate = currentDate.subtract(1, "day");
    } else {
      break;
    }
  }
  
  return streak;
}

export async function calculateFinancialHealthScore(): Promise<number> {
  const transactions = await db.transactions.toArray();
  const budgets = await db.budgets.toArray();
  
  if (transactions.length === 0) return 0;
  
  let score = 0;
  
  // Factor 1: Savings rate (40 points max)
  const startOfMonth = dayjs().startOf("month");
  const endOfMonth = dayjs().endOf("month");
  const monthlyTransactions = transactions.filter(t => {
    const date = dayjs(t.date);
    return date.isAfter(startOfMonth.subtract(1, "ms")) && date.isBefore(endOfMonth.add(1, "ms"));
  });
  
  const income = monthlyTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
  const expenses = monthlyTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
  
  if (income > 0) {
    const savingsRate = ((income - expenses) / income) * 100;
    score += Math.min(40, savingsRate * 2); // 20% savings rate = 40 points
  }
  
  // Factor 2: Budget adherence (30 points max)
  if (budgets.length > 0) {
    const budgetsWithinLimit = budgets.filter(b => b.status !== "exceeded").length;
    const budgetScore = (budgetsWithinLimit / budgets.length) * 30;
    score += budgetScore;
  }
  
  // Factor 3: Transaction consistency (20 points max)
  const streak = await calculateCurrentStreak();
  score += Math.min(20, streak * 2);
  
  // Factor 4: Expense categorization (10 points max)
  const categorizedTransactions = transactions.filter(t => t.category !== "Other").length;
  const categorizationRate = transactions.length > 0 ? (categorizedTransactions / transactions.length) * 10 : 0;
  score += categorizationRate;
  
  return Math.round(Math.min(100, score));
}

export async function checkAndUnlockAchievements(): Promise<Achievement[]> {
  const allAchievements = await db.achievements.toArray();
  const achievements = allAchievements.filter(a => !a.completed);
  const unlockedAchievements: Achievement[] = [];
  
  for (const achievement of achievements) {
    const progress = await calculateAchievementProgress(achievement);
    
    if (progress >= achievement.requirement && !achievement.completed) {
      const updatedAchievement: Achievement = {
        ...achievement,
        progress: achievement.requirement,
        completed: true,
        unlockedAt: dayjs().toISOString(),
      };
      
      await db.achievements.update(achievement.id, updatedAchievement);
      unlockedAchievements.push(updatedAchievement);
    } else if (progress !== achievement.progress) {
      await db.achievements.update(achievement.id, { progress });
    }
  }
  
  return unlockedAchievements;
}

export async function calculateAchievementProgress(achievement: Achievement): Promise<number> {
  const transactions = await db.transactions.toArray();
  const budgets = await db.budgets.toArray();
  
  switch (achievement.type) {
    case "milestone":
      if (achievement.title === "First Steps") {
        return transactions.length >= 1 ? 1 : 0;
      } else if (achievement.title === "Century Club") {
        return transactions.length;
      } else if (achievement.title === "Financial Guru") {
        const healthScore = await calculateFinancialHealthScore();
        return healthScore;
      }
      break;
      
    case "streak":
      const streak = await calculateCurrentStreak();
      return streak;
      
    case "savings":
      const startOfMonth = dayjs().startOf("month");
      const endOfMonth = dayjs().endOf("month");
      const monthlyTransactions = transactions.filter(t => {
        const date = dayjs(t.date);
        return date.isAfter(startOfMonth.subtract(1, "ms")) && date.isBefore(endOfMonth.add(1, "ms"));
      });
      
      const income = monthlyTransactions.filter(t => t.type === "income").reduce((sum, t) => sum + t.amount, 0);
      const expenses = monthlyTransactions.filter(t => t.type === "expense").reduce((sum, t) => sum + t.amount, 0);
      const savings = Math.max(0, income - expenses);
      
      return savings;
      
    case "spending":
      if (achievement.title === "Budget Master") {
        if (budgets.length === 0) return 0;
        const budgetsWithinLimit = budgets.filter(b => b.status !== "exceeded").length;
        return budgetsWithinLimit === budgets.length ? 1 : 0;
      }
      break;
  }
  
  return 0;
}

export async function getUserStats(): Promise<UserStats> {
  return await initializeUserStats();
}

export async function getAllAchievements(): Promise<Achievement[]> {
  await initializeAchievements();
  return await db.achievements.toArray();
}

import dayjs from "dayjs";
import { inr } from "./utils";
import { Category } from "./types";
import {
  totalIncome,
  totalExpenses,
  topCategory,
  projectSavingsWithCut,
  overspendCategories,
  getInvestmentRecommendation,
} from "./calc";

export interface ChatMessage {
  id: string;
  type: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface IntentResponse {
  intent: string;
  confidence: number;
  data?: Record<string, unknown>;
}

// Intent detection using keyword matching
export function detectIntent(query: string): IntentResponse {
  const lowerQuery = query.toLowerCase();
  
  // Savings analysis
  if (lowerQuery.includes("save") || lowerQuery.includes("saving") || lowerQuery.includes("बचत") || lowerQuery.includes("बचती")) {
    if (lowerQuery.includes("more") || lowerQuery.includes("ज्यादा") || lowerQuery.includes("अधिक")) {
      return { intent: "savings_analysis", confidence: 0.9 };
    }
    if (lowerQuery.includes("goal") || lowerQuery.includes("लक्ष्य") || lowerQuery.includes("उद्दिष्ट")) {
      return { intent: "savings_goal", confidence: 0.8 };
    }
    return { intent: "savings_general", confidence: 0.7 };
  }
  
  // Top expenses
  if (lowerQuery.includes("top") || lowerQuery.includes("highest") || lowerQuery.includes("सबसे") || lowerQuery.includes("मुख्य")) {
    if (lowerQuery.includes("expense") || lowerQuery.includes("खर्च") || lowerQuery.includes("खर्चा")) {
      return { intent: "top_expense", confidence: 0.9 };
    }
    if (lowerQuery.includes("category") || lowerQuery.includes("श्रेणी")) {
      return { intent: "top_category", confidence: 0.8 };
    }
  }
  
  // Overspending analysis
  if (lowerQuery.includes("overspend") || lowerQuery.includes("over") || lowerQuery.includes("ज्यादा") || lowerQuery.includes("अधिक")) {
    if (lowerQuery.includes("food") || lowerQuery.includes("खाना") || lowerQuery.includes("अन्न")) {
      return { intent: "overspend_category", confidence: 0.9, data: { category: "Food" } };
    }
    if (lowerQuery.includes("shopping") || lowerQuery.includes("शॉपिंग")) {
      return { intent: "overspend_category", confidence: 0.9, data: { category: "Shopping" } };
    }
    return { intent: "overspend_analysis", confidence: 0.8 };
  }
  
  // Investment recommendations
  if (lowerQuery.includes("invest") || lowerQuery.includes("investment") || lowerQuery.includes("निवेश") || lowerQuery.includes("गुंतवणूक")) {
    const amountMatch = lowerQuery.match(/₹?(\d+(?:,\d+)*)/);
    if (amountMatch) {
      const amount = parseInt(amountMatch[1].replace(/,/g, ""));
      return { intent: "investment_recommendation", confidence: 0.9, data: { amount } };
    }
    return { intent: "investment_general", confidence: 0.7 };
  }
  
  // Savings projection with cuts
  if (lowerQuery.includes("cut") || lowerQuery.includes("reduce") || lowerQuery.includes("कम") || lowerQuery.includes("घट")) {
    const percentMatch = lowerQuery.match(/(\d+)%/);
    if (percentMatch) {
      const percent = parseInt(percentMatch[1]);
      if (lowerQuery.includes("food") || lowerQuery.includes("dining") || lowerQuery.includes("खाना")) {
        return { intent: "savings_projection", confidence: 0.9, data: { category: "Food", percent } };
      }
      if (lowerQuery.includes("shopping") || lowerQuery.includes("शॉपिंग")) {
        return { intent: "savings_projection", confidence: 0.9, data: { category: "Shopping", percent } };
      }
    }
  }
  
  // Income analysis
  if (lowerQuery.includes("income") || lowerQuery.includes("earn") || lowerQuery.includes("आय") || lowerQuery.includes("कमाई")) {
    return { intent: "income_analysis", confidence: 0.8 };
  }
  
  // Expense analysis
  if (lowerQuery.includes("expense") || lowerQuery.includes("spend") || lowerQuery.includes("खर्च") || lowerQuery.includes("खर्चा")) {
    return { intent: "expense_analysis", confidence: 0.8 };
  }
  
  // General financial advice
  if (lowerQuery.includes("advice") || lowerQuery.includes("tip") || lowerQuery.includes("सलाह") || lowerQuery.includes("सूचना")) {
    return { intent: "financial_advice", confidence: 0.7 };
  }
  
  return { intent: "unknown", confidence: 0.1 };
}

// Response generation based on intent
export async function generateResponse(
  query: string,
  t: (key: string) => string
): Promise<string> {
  const intent = detectIntent(query);
  const currentMonth = dayjs().format("YYYY-MM");
  
  try {
    switch (intent.intent) {
      case "savings_analysis":
        const income = await totalIncome(currentMonth);
        const expenses = await totalExpenses(currentMonth);
        const savings = income - expenses;
        const savingsRate = income > 0 ? ((savings / income) * 100).toFixed(1) : "0";
        
        if (savingsRate >= "20") {
          return t("ai.savings.excellent").replace("{savings}", inr(savings)).replace("{rate}", savingsRate);
        } else if (savingsRate >= "10") {
          return t("ai.savings.good").replace("{savings}", inr(savings)).replace("{rate}", savingsRate);
        } else {
          return t("ai.savings.needs_improvement").replace("{savings}", inr(savings)).replace("{rate}", savingsRate);
        }
        
      case "top_expense":
        const topExpense = await topCategory(currentMonth);
        if (topExpense.category) {
          return t("ai.top_expense").replace("{category}", topExpense.category).replace("{amount}", inr(topExpense.amount));
        }
        return t("ai.no_expenses");
        
      case "overspend_category":
        const overspend = await overspendCategories(currentMonth);
        const categoryOverspend = overspend.find(o => o.category === intent.data?.category);
        if (categoryOverspend) {
          return t("ai.overspend.category")
            .replace("{category}", categoryOverspend.category)
            .replace("{current}", inr(categoryOverspend.currentSpending))
            .replace("{limit}", inr(categoryOverspend.budgetLimit))
            .replace("{overspend}", inr(categoryOverspend.overspendAmount));
        }
        const category = intent.data?.category as string || "";
        return t("ai.overspend.within_budget").replace("{category}", category);
        
      case "investment_recommendation":
        const amount = intent.data?.amount as number || 10000;
        const recommendation = getInvestmentRecommendation(amount);
        return t("ai.investment.recommendation")
          .replace("{type}", recommendation.type)
          .replace("{amount}", inr(recommendation.amount))
          .replace("{risk}", recommendation.risk)
          .replace("{description}", recommendation.description)
          .replace("{return}", recommendation.expectedReturn);
        
      case "savings_projection":
        const projectionCategory = intent.data?.category as string || "Food";
        const projectionPercent = intent.data?.percent as number || 15;
        const projection = await projectSavingsWithCut(
          currentMonth,
          projectionCategory as Category,
          projectionPercent
        );
        return t("ai.savings_projection.projection")
          .replace("{category}", projectionCategory)
          .replace("{percent}", projectionPercent.toString())
          .replace("{current}", inr(projection.currentSavings))
          .replace("{projected}", inr(projection.projectedSavings))
          .replace("{increase}", inr(projection.increase));
        
      case "income_analysis":
        const monthlyIncome = await totalIncome(currentMonth);
        return t("ai.income.analysis").replace("{income}", inr(monthlyIncome));
        
      case "expense_analysis":
        const monthlyExpenses = await totalExpenses(currentMonth);
        return t("ai.expense.analysis").replace("{expenses}", inr(monthlyExpenses));
        
      case "financial_advice":
        const adviceIndex = Math.floor(Math.random() * 8);
        return t(`ai.advice.${adviceIndex}`);
        
      default:
        return t("ai.unknown_query");
    }
  } catch (error) {
    console.error("Error generating response:", error);
    return t("ai.error");
  }
}

// Quick action suggestions
export function getQuickActions(t: (key: string) => string): string[] {
  return [
    t("ai.quick_actions.savings"),
    t("ai.quick_actions.top_expense"),
    t("ai.quick_actions.overspend_food"),
    t("ai.quick_actions.investment"),
    t("ai.quick_actions.cut_dining"),
  ];
}

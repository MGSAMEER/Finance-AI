"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { UserStats } from "@/lib/types";
import { inr } from "@/lib/utils";
import { 
  Trophy, 
  Flame, 
  Target, 
  TrendingUp, 
  Award,
  Star 
} from "lucide-react";

interface StatsCardProps {
  stats: UserStats;
}

export function StatsCard({ stats }: StatsCardProps) {
  const getHealthScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600 dark:text-green-400";
    if (score >= 60) return "text-yellow-600 dark:text-yellow-400";
    return "text-red-600 dark:text-red-400";
  };

  const getHealthScoreLabel = (score: number) => {
    if (score >= 90) return "Excellent";
    if (score >= 80) return "Very Good";
    if (score >= 70) return "Good";
    if (score >= 60) return "Fair";
    return "Needs Improvement";
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Level and Points */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 border-purple-200 dark:border-purple-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Level & Points</CardTitle>
          <Star className="h-4 w-4 text-purple-600 dark:text-purple-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  Level {stats.level}
                </div>
                <p className="text-xs text-muted-foreground">
                  {stats.totalPoints} total points
                </p>
              </div>
              <Badge variant="secondary" className="bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300">
                <Trophy className="mr-1 h-3 w-3" />
                {stats.totalPoints}
              </Badge>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Next Level</span>
                <span>{stats.nextLevelPoints - stats.totalPoints} points to go</span>
              </div>
              <Progress 
                value={(stats.totalPoints % 100)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Health Score */}
      <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Financial Health</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600 dark:text-green-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getHealthScoreColor(stats.financialHealthScore)}`}>
                  {stats.financialHealthScore}/100
                </div>
                <p className="text-xs text-muted-foreground">
                  {getHealthScoreLabel(stats.financialHealthScore)}
                </p>
              </div>
            </div>
            <Progress 
              value={stats.financialHealthScore} 
              className="h-2"
            />
          </div>
        </CardContent>
      </Card>

      {/* Current Streak */}
      <Card className="bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border-orange-200 dark:border-orange-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tracking Streak</CardTitle>
          <Flame className="h-4 w-4 text-orange-600 dark:text-orange-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                  {stats.currentStreak}
                </div>
                <p className="text-xs text-muted-foreground">
                  days in a row
                </p>
              </div>
              <div className="text-right">
                <div className="text-sm font-medium text-muted-foreground">
                  Best: {stats.longestStreak}
                </div>
              </div>
            </div>
            {stats.currentStreak > 0 && (
              <div className="text-xs text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/30 p-2 rounded">
                🔥 Keep the streak alive!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Monthly Savings */}
      <Card className="bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-900/20 dark:to-cyan-900/20 border-blue-200 dark:border-blue-800">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Savings</CardTitle>
          <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {inr(stats.totalSavings)}
                </div>
                <p className="text-xs text-muted-foreground">
                  this month
                </p>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Goal Progress</span>
                <span>{stats.monthlyGoalProgress.toFixed(1)}%</span>
              </div>
              <Progress 
                value={Math.min(100, stats.monthlyGoalProgress)} 
                className="h-2"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Achievements */}
      <Card className="bg-gradient-to-br from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 border-yellow-200 dark:border-yellow-800 md:col-span-2 lg:col-span-1">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Achievements</CardTitle>
          <Award className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                  {stats.achievementsUnlocked}
                </div>
                <p className="text-xs text-muted-foreground">
                  achievements unlocked
                </p>
              </div>
              <Badge variant="secondary" className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300">
                <Trophy className="mr-1 h-3 w-3" />
                Earned
              </Badge>
            </div>
            {stats.achievementsUnlocked > 0 && (
              <div className="text-xs text-yellow-600 dark:text-yellow-400 bg-yellow-100 dark:bg-yellow-900/30 p-2 rounded">
                🏆 Great progress! Keep unlocking more achievements.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

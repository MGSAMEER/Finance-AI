"use client";

import { useEffect, useState, useCallback } from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AchievementCard } from "@/components/gamification/AchievementCard";
import { StatsCard } from "@/components/gamification/StatsCard";
import { Achievement, UserStats } from "@/lib/types";
import { 
  getAllAchievements, 
  getUserStats, 
  updateUserStats, 
  checkAndUnlockAchievements 
} from "@/lib/gamification";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Target, Zap, Award } from "lucide-react";

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    try {
      // Update stats and check for new achievements
      const [, newAchievements] = await Promise.all([
        updateUserStats(),
        checkAndUnlockAchievements(),
      ]);
      
      // Show toast for newly unlocked achievements
      if (newAchievements.length > 0) {
        newAchievements.forEach(achievement => {
          toast({
            title: "🎉 Achievement Unlocked!",
            description: `${achievement.title} - ${achievement.description}`,
            duration: 5000,
          });
        });
      }
      
      const [allAchievements, stats] = await Promise.all([
        getAllAchievements(),
        getUserStats(),
      ]);
      
      setAchievements(allAchievements);
      setUserStats(stats);
    } catch (error) {
      console.error("Error loading achievements:", error);
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold tracking-tight">Achievements</h1>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-32 bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const completedAchievements = achievements.filter(a => a.completed);
  const inProgressAchievements = achievements.filter(a => !a.completed && a.progress > 0);
  const lockedAchievements = achievements.filter(a => !a.completed && a.progress === 0);
  
  const achievementsByType = {
    milestone: achievements.filter(a => a.type === "milestone"),
    savings: achievements.filter(a => a.type === "savings"),
    spending: achievements.filter(a => a.type === "spending"),
    streak: achievements.filter(a => a.type === "streak"),
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Achievements & Progress</h1>
          <p className="text-muted-foreground">
            Track your financial journey and unlock achievements as you build better habits.
          </p>
        </div>
      </div>

      {/* User Stats Overview */}
      {userStats && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Progress</h2>
          <StatsCard stats={userStats} />
        </div>
      )}

      {/* Achievements */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Achievements</h2>
        
        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="all">All ({achievements.length})</TabsTrigger>
            <TabsTrigger value="completed">
              Completed ({completedAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="progress">
              In Progress ({inProgressAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="locked">
              Locked ({lockedAchievements.length})
            </TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="all" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {achievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="completed" className="space-y-4">
            {completedAchievements.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Trophy className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Achievements Yet</h3>
                  <p className="text-muted-foreground">
                    Start tracking your finances to unlock your first achievement!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {completedAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="progress" className="space-y-4">
            {inProgressAchievements.length === 0 ? (
              <Card>
                <CardContent className="p-6 text-center">
                  <Target className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No Progress Yet</h3>
                  <p className="text-muted-foreground">
                    Keep using the app to make progress on achievements!
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {inProgressAchievements.map((achievement) => (
                  <AchievementCard key={achievement.id} achievement={achievement} />
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="locked" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {lockedAchievements.map((achievement) => (
                <AchievementCard key={achievement.id} achievement={achievement} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="categories" className="space-y-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Milestones
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {achievementsByType.milestone.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Award className="h-5 w-5 text-green-500" />
                  Savings Goals
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {achievementsByType.savings.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Target className="h-5 w-5 text-blue-500" />
                  Smart Spending
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {achievementsByType.spending.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Consistency Streaks
                </h3>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {achievementsByType.streak.map((achievement) => (
                    <AchievementCard key={achievement.id} achievement={achievement} />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

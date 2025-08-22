"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Achievement } from "@/lib/types";
import { Trophy, Clock } from "lucide-react";
import dayjs from "dayjs";

interface AchievementCardProps {
  achievement: Achievement;
}

export function AchievementCard({ achievement }: AchievementCardProps) {
  const progressPercentage = (achievement.progress / achievement.requirement) * 100;

  return (
    <Card className={`relative ${achievement.completed ? 'bg-gradient-to-br from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800' : ''}`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`text-2xl ${achievement.completed ? 'animate-pulse' : 'grayscale'}`}>
              {achievement.icon}
            </div>
            <div>
              <CardTitle className="text-base font-semibold">
                {achievement.title}
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {achievement.description}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            {achievement.completed ? (
              <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <Trophy className="mr-1 h-3 w-3" />
                Unlocked
              </Badge>
            ) : (
              <Badge variant="secondary">
                <Clock className="mr-1 h-3 w-3" />
                In Progress
              </Badge>
            )}
            <div className="text-right">
              <div className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
                +{achievement.points} pts
              </div>
            </div>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-medium">
              {achievement.progress.toLocaleString()} / {achievement.requirement.toLocaleString()}
            </span>
          </div>
          
          <Progress 
            value={Math.min(100, progressPercentage)} 
            className={`h-2 ${achievement.completed ? 'bg-gradient-to-r from-yellow-200 to-orange-200' : ''}`}
          />
          
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>{progressPercentage.toFixed(1)}% complete</span>
            {achievement.unlockedAt && (
              <span>
                Unlocked {dayjs(achievement.unlockedAt).format("MMM D, YYYY")}
              </span>
            )}
          </div>
        </div>
        
        {achievement.completed && (
          <div className="mt-3 p-2 bg-gradient-to-r from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 rounded text-center">
            <div className="text-sm font-medium text-yellow-700 dark:text-yellow-300">
              🎉 Achievement Unlocked! 🎉
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

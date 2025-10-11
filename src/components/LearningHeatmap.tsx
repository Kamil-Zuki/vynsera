"use client";

import { useState, useEffect } from "react";
import { Calendar, Flame, Target, BookOpen, Clock } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { useProgress } from "./ProgressProvider";

interface ActivityData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4; // 0 = no activity, 4 = max activity
}

interface LearningHeatmapProps {
  className?: string;
}

export default function LearningHeatmap({ className = "" }: LearningHeatmapProps) {
  const { showKorean } = useLanguage();
  const { stats } = useProgress();
  const [activityData, setActivityData] = useState<ActivityData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchActivityData();
  }, []);

  const fetchActivityData = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/user/activity");
      if (response.ok) {
        const data = await response.json();
        setActivityData(data.activityData || []);
      }
    } catch (error) {
      console.error("Failed to fetch activity data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate calendar data for the last year
  const generateCalendarData = () => {
    const today = new Date();
    const oneYearAgo = new Date(today);
    oneYearAgo.setFullYear(today.getFullYear() - 1);

    const calendarData: ActivityData[] = [];
    const activityMap = new Map(
      activityData.map((item) => [item.date, item])
    );

    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      const activity = activityMap.get(dateStr);
      
      calendarData.push({
        date: dateStr,
        count: activity?.count || 0,
        level: activity?.level || 0,
      });
    }

    return calendarData;
  };

  const getActivityLevel = (count: number): 0 | 1 | 2 | 3 | 4 => {
    if (count === 0) return 0;
    if (count <= 2) return 1;
    if (count <= 5) return 2;
    if (count <= 10) return 3;
    return 4;
  };

  const getLevelColor = (level: number) => {
    const colors = [
      "bg-muted", // 0 - no activity
      "bg-green-200 dark:bg-green-900", // 1 - low activity
      "bg-green-300 dark:bg-green-800", // 2 - medium activity
      "bg-green-400 dark:bg-green-700", // 3 - high activity
      "bg-green-500 dark:bg-green-600", // 4 - max activity
    ];
    return colors[level] || colors[0];
  };

  const getTooltipText = (activity: ActivityData) => {
    if (activity.count === 0) {
      return showKorean ? "활동 없음" : "No activity";
    }
    return showKorean 
      ? `${activity.count}개 활동` 
      : `${activity.count} activities`;
  };

  const calendarData = generateCalendarData();
  const totalDays = calendarData.length;
  const activeDays = calendarData.filter(d => d.count > 0).length;
  const currentStreak = calculateCurrentStreak(calendarData);
  const longestStreak = calculateLongestStreak(calendarData);

  if (isLoading) {
    return (
      <div className={`border border-border/40 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-6 h-6 text-foreground" />
          <h2 className="text-xl font-bold text-foreground">
            {showKorean ? "학습 히트맵" : "Learning Heatmap"}
          </h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`border border-border/40 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Calendar className="w-6 h-6 text-foreground" />
          <h2 className="text-xl font-bold text-foreground">
            {showKorean ? "학습 히트맵" : "Learning Heatmap"}
          </h2>
        </div>
        <div className="text-sm text-muted-foreground">
          {showKorean ? "지난 1년" : "Past year"}
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{activeDays}</div>
          <div className="text-xs text-muted-foreground">
            {showKorean ? "활동일" : "Active days"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{currentStreak}</div>
          <div className="text-xs text-muted-foreground">
            {showKorean ? "현재 연속" : "Current streak"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">{longestStreak}</div>
          <div className="text-xs text-muted-foreground">
            {showKorean ? "최장 연속" : "Longest streak"}
          </div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-foreground">
            {Math.round((activeDays / totalDays) * 100)}%
          </div>
          <div className="text-xs text-muted-foreground">
            {showKorean ? "활동률" : "Activity rate"}
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="overflow-x-auto">
        <div className="flex gap-1 min-w-max">
          {calendarData.map((activity, index) => (
            <div
              key={activity.date}
              className={`w-3 h-3 rounded-sm ${getActivityLevel(activity.count)} hover:ring-2 hover:ring-foreground/20 transition-all cursor-pointer`}
              title={`${activity.date}: ${getTooltipText(activity)}`}
            />
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mt-4 text-xs text-muted-foreground">
        <span>{showKorean ? "활동 없음" : "Less"}</span>
        <div className="flex gap-1">
          {[0, 1, 2, 3, 4].map((level) => (
            <div
              key={level}
              className={`w-3 h-3 rounded-sm ${getLevelColor(level)}`}
            />
          ))}
        </div>
        <span>{showKorean ? "많음" : "More"}</span>
      </div>
    </div>
  );
}

// Helper functions
function calculateCurrentStreak(data: ActivityData[]): number {
  let streak = 0;
  const today = new Date().toISOString().split("T")[0];
  
  for (let i = data.length - 1; i >= 0; i--) {
    if (data[i].date === today || data[i].count > 0) {
      streak++;
    } else {
      break;
    }
  }
  
  return streak;
}

function calculateLongestStreak(data: ActivityData[]): number {
  let maxStreak = 0;
  let currentStreak = 0;
  
  for (const activity of data) {
    if (activity.count > 0) {
      currentStreak++;
      maxStreak = Math.max(maxStreak, currentStreak);
    } else {
      currentStreak = 0;
    }
  }
  
  return maxStreak;
}


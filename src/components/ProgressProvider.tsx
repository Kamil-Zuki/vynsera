"use client";

import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { Achievement, StreakData, UserStats } from "@/types";

interface ProgressContextType {
  completedSteps: Set<string>;
  toggleStep: (stepId: string) => void;
  isStepCompleted: (stepId: string) => boolean;
  getProgressPercentage: (totalSteps: number) => number;
  streakData: StreakData | null;
  stats: UserStats | null;
  checkAchievements: () => Promise<Achievement[]>;
  refreshData: () => void;
  trackActivity: (activityType: string, count?: number) => Promise<void>;
}

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined
);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);
  const [streakData, setStreakData] = useState<StreakData | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [lastStreakUpdate, setLastStreakUpdate] = useState<string | null>(null);

  // Load progress from localStorage or database
  useEffect(() => {
    async function loadProgress() {
      if (status === "loading") return;

      if (status === "authenticated") {
        // Load from database
        try {
          const response = await fetch("/api/user/progress");
          if (response.ok) {
            const data = await response.json();
            setCompletedSteps(new Set(data.completedSteps || []));
            setStreakData(data.streakData || null);
            setStats(data.stats || null);
            setIsLoaded(true);

            // Update streak on first load
            updateStreak();
          } else {
            // Fallback to localStorage
            loadFromLocalStorage();
          }
        } catch (error) {
          console.error("Failed to load progress from database:", error);
          loadFromLocalStorage();
        }
      } else {
        // Load from localStorage
        loadFromLocalStorage();
      }
    }

    function loadFromLocalStorage() {
      const savedProgress = localStorage.getItem("korean-learning-progress");
      if (savedProgress) {
        try {
          const steps = JSON.parse(savedProgress);
          setCompletedSteps(new Set(steps));
        } catch (error) {
          console.error("Error loading progress:", error);
        }
      }
      setIsLoaded(true);
    }

    loadProgress();
  }, [status]);

  // Update streak when user is active
  const updateStreak = async () => {
    if (status !== "authenticated") return;

    const today = new Date().toISOString().split("T")[0];
    
    // Only update once per day
    if (lastStreakUpdate === today) return;

    try {
      const response = await fetch("/api/user/streak", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        setStreakData(data.streakData);
        setStats(data.stats);
        setLastStreakUpdate(today);
      }
    } catch (error) {
      console.error("Failed to update streak:", error);
    }
  };

  // Save progress to localStorage and/or database
  useEffect(() => {
    if (!isLoaded) return;

    const stepsArray = Array.from(completedSteps);

    // Always save to localStorage as backup
    localStorage.setItem(
      "korean-learning-progress",
      JSON.stringify(stepsArray)
    );

    // If authenticated, sync to database
    if (status === "authenticated") {
      const syncToDatabase = async () => {
        try {
          await fetch("/api/user/progress", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ completedSteps: stepsArray }),
          });
        } catch (error) {
          console.error("Failed to sync progress to database:", error);
        }
      };
      syncToDatabase();
    }
  }, [completedSteps, isLoaded, status]);

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(stepId)) {
        newSet.delete(stepId);
      } else {
        newSet.add(stepId);
      }
      return newSet;
    });
  };

  const isStepCompleted = (stepId: string) => {
    return completedSteps.has(stepId);
  };

  const getProgressPercentage = (totalSteps: number) => {
    return totalSteps > 0
      ? Math.round((completedSteps.size / totalSteps) * 100)
      : 0;
  };

  const checkAchievements = useCallback(async (): Promise<Achievement[]> => {
    if (status !== "authenticated") return [];

    try {
      const response = await fetch("/api/achievements", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update stats from response
        if (data.stats) {
          setStats(data.stats);
        }

        return data.newAchievements || [];
      }
    } catch (error) {
      console.error("Failed to check achievements:", error);
    }

    return [];
  }, [status]);

  const refreshData = useCallback(async () => {
    if (status !== "authenticated") return;

    try {
      const response = await fetch("/api/user/progress");
      if (response.ok) {
        const data = await response.json();
        setCompletedSteps(new Set(data.completedSteps || []));
        setStreakData(data.streakData || null);
        setStats(data.stats || null);
      }
    } catch (error) {
      console.error("Failed to refresh data:", error);
    }
  }, [status]);

  const trackActivity = useCallback(async (activityType: string, count: number = 1) => {
    if (status !== "authenticated") return;

    try {
      await fetch("/api/user/activity", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ activityType, count }),
      });
    } catch (error) {
      console.error("Failed to track activity:", error);
    }
  }, [status]);

  const value = {
    completedSteps,
    toggleStep,
    isStepCompleted,
    getProgressPercentage,
    streakData,
    stats,
    checkAchievements,
    refreshData,
    trackActivity,
  };

  return (
    <ProgressContext.Provider value={value}>
      {children}
    </ProgressContext.Provider>
  );
}

export function useProgress() {
  const context = useContext(ProgressContext);
  if (context === undefined) {
    throw new Error("useProgress must be used within a ProgressProvider");
  }
  return context;
}

"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface ProgressContextType {
  completedSteps: Set<string>;
  toggleStep: (stepId: string) => void;
  isStepCompleted: (stepId: string) => boolean;
  getProgressPercentage: (totalSteps: number) => number;
}

const ProgressContext = createContext<ProgressContextType | undefined>(
  undefined
);

export function ProgressProvider({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

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
            setIsLoaded(true);
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

  const value = {
    completedSteps,
    toggleStep,
    isStepCompleted,
    getProgressPercentage,
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

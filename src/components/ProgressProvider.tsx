"use client";

import { createContext, useContext, useEffect, useState } from "react";

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
  const [completedSteps, setCompletedSteps] = useState<Set<string>>(new Set());

  useEffect(() => {
    // Load progress from localStorage
    const savedProgress = localStorage.getItem("korean-learning-progress");
    if (savedProgress) {
      try {
        const steps = JSON.parse(savedProgress);
        setCompletedSteps(new Set(steps));
      } catch (error) {
        console.error("Error loading progress:", error);
      }
    }
  }, []);

  useEffect(() => {
    // Save progress to localStorage
    if (completedSteps.size > 0) {
      localStorage.setItem(
        "korean-learning-progress",
        JSON.stringify(Array.from(completedSteps))
      );
    }
  }, [completedSteps]);

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

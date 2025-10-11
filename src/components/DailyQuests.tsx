"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Clock, Star, Zap, Target, Trophy } from "lucide-react";
import { useLanguage } from "./LanguageProvider";
import { useProgress } from "./ProgressProvider";
import { showAchievementToast } from "./AchievementToast";
import type { DailyQuest } from "@/types";

interface DailyQuestsProps {
  className?: string;
}

const difficultyColors = {
  easy: "text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300",
  medium: "text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300",
  hard: "text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300",
};

const categoryIcons = {
  steps: Target,
  resources: Star,
  streak: Zap,
  exploration: Star,
  special: Trophy,
};

export default function DailyQuests({ className = "" }: DailyQuestsProps) {
  const { showKorean } = useLanguage();
  const { stats } = useProgress();
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDailyQuests();
  }, []);

  const fetchDailyQuests = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/quests/daily");
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched daily quests:", data);
        setQuests(data.quests || []);
      }
    } catch (error) {
      console.error("Failed to fetch daily quests:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const claimReward = async (questId: string) => {
    try {
      const response = await fetch("/api/quests/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ questId }),
      });

      if (response.ok) {
        const result = await response.json();
        // Refresh quests
        fetchDailyQuests();
        // Show success message
        console.log("Reward claimed:", result);
        try {
          // Show a small achievement-style toast with XP gained
          showAchievementToast({
            id: `quest-claimed-${questId}`,
            title: "Reward claimed",
            titleKorean: "보상 받음",
            description: result.rewards?.xp ? `+${result.rewards.xp} XP` : "Reward claimed",
            descriptionKorean: result.rewards?.xp ? `+${result.rewards.xp} XP` : undefined,
            icon: "✨",
            category: "special",
            rarity: "common",
            requirement: { type: "custom", value: 0 },
            reward: { xp: result.rewards?.xp || 0 },
          } as any);
        } catch (e) {
          // Fallback: basic alert if toast fails
          if (result.rewards?.xp) alert(`+${result.rewards.xp} XP`);
        }
      } else {
        // Parse error payload robustly (server may return JSON or text)
        let errorBody: any = null;
        try {
          errorBody = await response.json();
        } catch (e) {
          try {
            errorBody = await response.text();
          } catch (_) {
            errorBody = null;
          }
        }

  const msg = (errorBody && (errorBody.error || errorBody.message || errorBody)) || response.statusText || "Failed to claim reward";
  // Expected API failures (e.g. quest not completed/already claimed) are logged at warn level
  console.warn(`Failed to claim reward (status ${response.status}):`, msg);
        // Show a user-facing error
        alert(typeof msg === "string" ? msg : JSON.stringify(msg));
      }
    } catch (error) {
      console.error("Failed to claim reward:", error);
      alert("Failed to claim reward");
    }
  };

  const getProgressPercentage = (quest: DailyQuest) => {
    return quest.maxProgress > 0 ? (quest.progress / quest.maxProgress) * 100 : 0;
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diff = expiry.getTime() - now.getTime();
    
    if (diff <= 0) return showKorean ? "만료됨" : "Expired";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return showKorean ? `${hours}시간 ${minutes}분 남음` : `${hours}h ${minutes}m left`;
    }
    return showKorean ? `${minutes}분 남음` : `${minutes}m left`;
  };

  if (isLoading) {
    return (
      <div className={`border border-border/40 rounded-lg p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <Trophy className="w-6 h-6 text-foreground" />
          <h2 className="text-xl font-bold text-foreground">
            {showKorean ? "일일 퀘스트" : "Daily Quests"}
          </h2>
        </div>
        <div className="flex items-center justify-center h-32">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
        </div>
      </div>
    );
  }

  const completedQuests = quests.filter(q => q.isCompleted);
  const activeQuests = quests.filter(q => !q.isCompleted);

  return (
    <div className={`border border-border/40 rounded-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Trophy className="w-6 h-6 text-foreground" />
          <h2 className="text-xl font-bold text-foreground">
            {showKorean ? "일일 퀘스트" : "Daily Quests"}
          </h2>
        </div>
        <div className="text-sm text-muted-foreground">
          {completedQuests.length}/{quests.length} {showKorean ? "완료" : "completed"}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-muted-foreground">
            {showKorean ? "오늘의 진행률" : "Today's Progress"}
          </span>
          <span className="font-medium text-foreground">
            {Math.round((completedQuests.length / quests.length) * 100)}%
          </span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
            style={{ width: `${(completedQuests.length / quests.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Debug Info */}
      {process.env.NODE_ENV === 'development' && (
        <div className="mb-4 p-3 bg-muted rounded text-xs">
          <div>Total quests: {quests.length}</div>
          <div>Completed quests: {completedQuests.length}</div>
          <div>Active quests: {activeQuests.length}</div>
          <div>User stats: {JSON.stringify(stats)}</div>
        </div>
      )}

      {/* Quests List */}
      <div className="space-y-4">
        {quests.map((quest) => {
          const CategoryIcon = categoryIcons[quest.category];
          const progressPercent = getProgressPercentage(quest);
          const isExpired = new Date(quest.expiresAt) < new Date();

          return (
            <div
              key={quest.id}
              className={`border border-border/40 rounded-lg p-4 transition-all ${
                quest.isCompleted
                  ? "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
                  : isExpired
                  ? "opacity-50"
                  : "hover:border-foreground/40"
              }`}
            >
              <div className="flex items-start gap-4">
                {/* Quest Icon */}
                <div className="flex-shrink-0">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${
                      quest.isCompleted
                        ? "bg-green-100 dark:bg-green-800"
                        : "bg-muted"
                    }`}
                  >
                    {quest.isCompleted ? (
                      <CheckCircle className="w-6 h-6 text-green-600" />
                    ) : (
                      <span>{quest.icon}</span>
                    )}
                  </div>
                </div>

                {/* Quest Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex-1">
                      <h3 className="font-semibold text-foreground mb-1">
                        {showKorean && quest.titleKorean
                          ? quest.titleKorean
                          : quest.title}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {showKorean && quest.descriptionKorean
                          ? quest.descriptionKorean
                          : quest.description}
                      </p>
                    </div>

                    {/* Difficulty Badge */}
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[quest.difficulty]}`}
                    >
                      {quest.difficulty}
                    </span>
                  </div>

                  {/* Progress */}
                  {!quest.isCompleted && (
                    <div className="mb-3">
                      <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                        <span>
                          {quest.progress} / {quest.maxProgress}
                        </span>
                        <span>{Math.round(progressPercent)}%</span>
                      </div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-foreground transition-all duration-300"
                          style={{ width: `${progressPercent}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Rewards and Time */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm">
                      {/* XP Reward */}
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-foreground font-medium">
                          +{quest.reward.xp} XP
                        </span>
                      </div>

                      {/* Coins Reward */}
                      {quest.reward.coins && (
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-600">💰</span>
                          <span className="text-foreground font-medium">
                            +{quest.reward.coins}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Time Remaining */}
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      <span>{getTimeRemaining(quest.expiresAt)}</span>
                    </div>
                  </div>

                  {/* Claim Button */}
                  {quest.isCompleted && !quest.reward?.claimed && (
                    <div className="mt-3">
                      <button
                        onClick={() => {
                          console.log("Claiming reward for quest:", quest.id, quest);
                          claimReward(quest.id);
                        }}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                      >
                        {showKorean ? "보상 받기" : "Claim Reward"}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {quests.length === 0 && (
        <div className="text-center py-8">
          <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            {showKorean ? "오늘의 퀘스트를 로드하는 중..." : "Loading today's quests..."}
          </p>
        </div>
      )}
    </div>
  );
}


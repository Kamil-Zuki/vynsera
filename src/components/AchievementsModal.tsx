"use client";

import { useState, useEffect } from "react";
import { X, Trophy, Flame, Target, Star, Sparkles } from "lucide-react";
import AchievementBadge from "./AchievementBadge";
import type { Achievement } from "@/types";
import { useLanguage } from "./LanguageProvider";

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const categoryIcons = {
  progress: Target,
  streak: Flame,
  milestone: Trophy,
  special: Sparkles,
  exploration: Star,
};

export default function AchievementsModal({
  isOpen,
  onClose,
}: AchievementsModalProps) {
  const { showKorean } = useLanguage();
  const [achievements, setAchievements] = useState<
    (Achievement & { unlocked: boolean; progress?: number; maxProgress?: number })[]
  >([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchAchievements();
    }
  }, [isOpen]);

  const fetchAchievements = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/achievements");
      if (response.ok) {
        const data = await response.json();
        setAchievements(data.achievements || []);
      }
    } catch (error) {
      console.error("Failed to fetch achievements:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const categories = [
    { id: "all", label: showKorean ? "전체" : "All" },
    { id: "progress", label: showKorean ? "진행" : "Progress" },
    { id: "milestone", label: showKorean ? "마일스톤" : "Milestones" },
    { id: "streak", label: showKorean ? "연속" : "Streaks" },
    { id: "exploration", label: showKorean ? "탐험" : "Exploration" },
    { id: "special", label: showKorean ? "특별" : "Special" },
  ];

  const filteredAchievements =
    selectedCategory === "all"
      ? achievements
      : achievements.filter((a) => a.category === selectedCategory);

  const unlockedCount = achievements.filter((a) => a.unlocked).length;
  const totalCount = achievements.length;
  const completionPercent = totalCount > 0 ? (unlockedCount / totalCount) * 100 : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-background border border-border/40 rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                {showKorean ? "업적" : "Achievements"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {unlockedCount} / {totalCount} {showKorean ? "잠금 해제됨" : "Unlocked"} (
                {completionPercent.toFixed(0)}%)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-muted transition-colors flex items-center justify-center"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="px-6 pt-4">
          <div className="w-full h-3 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
        </div>

        {/* Category Tabs */}
        <div className="px-6 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map((category) => {
              const Icon = categoryIcons[category.id as keyof typeof categoryIcons];
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4" />}
                  {category.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Achievement Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">
                {showKorean ? "로딩 중..." : "Loading..."}
              </p>
            </div>
          ) : filteredAchievements.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64">
              <Trophy className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {showKorean
                  ? "이 카테고리에는 업적이 없습니다"
                  : "No achievements in this category"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {filteredAchievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className="flex flex-col items-center"
                  title={
                    showKorean && achievement.descriptionKorean
                      ? achievement.descriptionKorean
                      : achievement.description
                  }
                >
                  <AchievementBadge
                    achievement={achievement}
                    size="medium"
                    showProgress={!achievement.unlocked}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border/40">
          <div className="flex items-center justify-between text-sm">
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-muted-foreground">
                  {showKorean ? "일반" : "Common"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-blue-400" />
                <span className="text-muted-foreground">
                  {showKorean ? "희귀" : "Rare"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-400" />
                <span className="text-muted-foreground">
                  {showKorean ? "에픽" : "Epic"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                <span className="text-muted-foreground">
                  {showKorean ? "전설" : "Legendary"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


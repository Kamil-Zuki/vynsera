"use client";

import { Lock } from "lucide-react";
import type { Achievement } from "@/types";
import { useLanguage } from "./LanguageProvider";

interface AchievementBadgeProps {
  achievement: Achievement & {
    unlocked: boolean;
    progress?: number;
    maxProgress?: number;
  };
  size?: "small" | "medium" | "large";
  showProgress?: boolean;
  onClick?: () => void;
}

const rarityColors = {
  common: {
    border: "border-gray-400",
    bg: "bg-gray-50",
    text: "text-gray-700",
    glow: "shadow-gray-200",
  },
  rare: {
    border: "border-blue-400",
    bg: "bg-blue-50",
    text: "text-blue-700",
    glow: "shadow-blue-200",
  },
  epic: {
    border: "border-purple-400",
    bg: "bg-purple-50",
    text: "text-purple-700",
    glow: "shadow-purple-200",
  },
  legendary: {
    border: "border-yellow-400",
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    glow: "shadow-yellow-300",
  },
};

const sizeClasses = {
  small: {
    container: "w-16 h-16",
    icon: "text-2xl",
    badge: "w-full h-full",
  },
  medium: {
    container: "w-24 h-24",
    icon: "text-4xl",
    badge: "w-full h-full",
  },
  large: {
    container: "w-32 h-32",
    icon: "text-5xl",
    badge: "w-full h-full",
  },
};

export default function AchievementBadge({
  achievement,
  size = "medium",
  showProgress = false,
  onClick,
}: AchievementBadgeProps) {
  const { showKorean } = useLanguage();
  const rarity = achievement.rarity || "common";
  const colors = rarityColors[rarity];
  const sizes = sizeClasses[size];

  const progressPercent = achievement.maxProgress
    ? ((achievement.progress || 0) / achievement.maxProgress) * 100
    : 0;

  return (
    <div
      className={`${onClick ? "cursor-pointer hover:scale-105" : ""} transition-transform`}
      onClick={onClick}
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      <div className="flex flex-col items-center gap-2">
        {/* Badge */}
        <div
          className={`${sizes.container} ${
            achievement.unlocked
              ? `${colors.border} ${colors.bg} border-2 shadow-lg ${colors.glow}`
              : "border-2 border-border/40 bg-muted/20"
          } rounded-full flex items-center justify-center relative overflow-hidden transition-all`}
        >
          {achievement.unlocked ? (
            <>
              <span className={sizes.icon}>{achievement.icon}</span>
              {achievement.rarity === "legendary" && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-yellow-200/20 to-transparent" />
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center gap-1">
              <Lock className="w-6 h-6 text-muted-foreground" />
              {showProgress && achievement.maxProgress && (
                <span className="text-xs text-muted-foreground font-medium">
                  {achievement.progress}/{achievement.maxProgress}
                </span>
              )}
            </div>
          )}

          {/* Progress ring for locked achievements */}
          {!achievement.unlocked && showProgress && achievement.maxProgress && (
            <svg
              className="absolute inset-0 w-full h-full -rotate-90"
              viewBox="0 0 100 100"
            >
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                className="text-border/40"
              />
              <circle
                cx="50"
                cy="50"
                r="45"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeDasharray={`${progressPercent * 2.827} 282.7`}
                className="text-foreground/60 transition-all duration-300"
              />
            </svg>
          )}
        </div>

        {/* Title */}
        {size !== "small" && (
          <div className="text-center max-w-[120px]">
            <p
              className={`text-xs font-medium ${
                achievement.unlocked ? "text-foreground" : "text-muted-foreground"
              } line-clamp-2`}
            >
              {showKorean && achievement.titleKorean
                ? achievement.titleKorean
                : achievement.title}
            </p>
            {achievement.unlocked && (
              <span
                className={`text-[10px] ${colors.text} font-semibold uppercase`}
              >
                {rarity}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


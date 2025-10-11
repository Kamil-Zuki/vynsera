"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import type { Achievement } from "@/types";
import { useLanguage } from "./LanguageProvider";

interface AchievementToastProps {
  achievement: Achievement;
  onClose: () => void;
}

export default function AchievementToast({
  achievement,
  onClose,
}: AchievementToastProps) {
  const { showKorean } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Fade in
    setTimeout(() => setIsVisible(true), 10);

    // Auto close after 5 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300);
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const rarityColors = {
    common: "from-gray-400 to-gray-600",
    rare: "from-blue-400 to-blue-600",
    epic: "from-purple-400 to-purple-600",
    legendary: "from-yellow-400 to-yellow-600",
  };

  const gradient = rarityColors[achievement.rarity] || rarityColors.common;

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 ${
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4"
      }`}
    >
      <div className="bg-background border-2 border-border rounded-xl shadow-2xl overflow-hidden max-w-sm">
        {/* Gradient Header */}
        <div className={`bg-gradient-to-r ${gradient} p-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-white">
              <Sparkles className="w-5 h-5" />
              <span className="font-bold text-sm uppercase">
                {showKorean ? "업적 달성!" : "Achievement Unlocked!"}
              </span>
            </div>
            <button
              onClick={() => {
                setIsVisible(false);
                setTimeout(onClose, 300);
              }}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-center gap-4">
            {/* Icon */}
            <div
              className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-3xl shadow-lg`}
            >
              {achievement.icon}
            </div>

            {/* Text */}
            <div className="flex-1">
              <h3 className="font-bold text-foreground mb-1">
                {showKorean && achievement.titleKorean
                  ? achievement.titleKorean
                  : achievement.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {showKorean && achievement.descriptionKorean
                  ? achievement.descriptionKorean
                  : achievement.description}
              </p>
              {achievement.reward?.xp && (
                <div className="mt-2 flex items-center gap-1">
                  <span className="text-xs font-medium text-yellow-600">
                    +{achievement.reward.xp} XP
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AchievementToastContainerProps {
  children: React.ReactNode;
}

export function AchievementToastContainer({
  children,
}: AchievementToastContainerProps) {
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Expose function to show achievements
  useEffect(() => {
    const handleShowAchievement = (event: CustomEvent<Achievement>) => {
      setAchievements((prev) => [...prev, event.detail]);
    };

    window.addEventListener(
      "showAchievement" as any,
      handleShowAchievement as any
    );

    return () => {
      window.removeEventListener(
        "showAchievement" as any,
        handleShowAchievement as any
      );
    };
  }, []);

  const handleClose = (index: number) => {
    setAchievements((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      {children}
      <div className="fixed top-0 right-0 z-50 pointer-events-none">
        <div className="p-4 space-y-4 pointer-events-auto">
          {achievements.map((achievement, index) => (
            <AchievementToast
              key={`${achievement.id}-${index}`}
              achievement={achievement}
              onClose={() => handleClose(index)}
            />
          ))}
        </div>
      </div>
    </>
  );
}

// Helper function to trigger achievement toast
export function showAchievementToast(achievement: Achievement) {
  const event = new CustomEvent("showAchievement", { detail: achievement });
  window.dispatchEvent(event);
}


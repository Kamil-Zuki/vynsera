"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Trophy,
  Target,
  Flame,
  TrendingUp,
  Calendar,
  Clock,
  BookOpen,
  Star,
  Award,
  CheckCircle2,
  Lock,
  Sparkles,
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useProgress } from "@/components/ProgressProvider";
import { useWatchlist } from "@/components/WatchlistProvider";
import AchievementBadge from "@/components/AchievementBadge";
import AchievementsModal from "@/components/AchievementsModal";
import { showAchievementToast } from "@/components/AchievementToast";
import type { Roadmap, Achievement } from "@/types";

export default function DashboardPageClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { showKorean } = useLanguage();
  const { completedSteps, getProgressPercentage, streakData, stats, checkAchievements } = useProgress();
  const { watchlistCount } = useWatchlist();

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [achievements, setAchievements] = useState<(Achievement & { unlocked: boolean })[]>([]);
  const [showAchievementsModal, setShowAchievementsModal] = useState(false);

  // Check authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          {showKorean ? "로딩 중..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-md text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
            <Lock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h1 className="text-3xl font-bold text-foreground mb-4">
            {showKorean ? "로그인이 필요합니다" : "Sign In Required"}
          </h1>
          <p className="text-muted-foreground mb-8">
            {showKorean
              ? "대시보드를 보려면 Google 계정으로 로그인해주세요."
              : "Please sign in with your Google account to view your dashboard."}
          </p>
          <button
            onClick={() => router.push("/auth/signin")}
            className="px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
          >
            {showKorean ? "로그인" : "Sign In with Google"}
          </button>
        </div>
      </div>
    );
  }

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch roadmap
        const response = await fetch("/api/roadmap");
        if (response.ok) {
          const data = await response.json();
          setRoadmap(data);
        }

        // Fetch achievements
        if (status === "authenticated") {
          const achievementsResponse = await fetch("/api/achievements");
          if (achievementsResponse.ok) {
            const achievementsData = await achievementsResponse.json();
            setAchievements(achievementsData.achievements || []);
          }

          // Check for new achievements
          const newAchievements = await checkAchievements();
          newAchievements.forEach((achievement) => {
            showAchievementToast(achievement);
          });
        }
      } catch (error) {
        console.error("Failed to fetch data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchData();
  }, [status, checkAchievements]);

  // Calculate statistics
  const calculatedStats = useMemo(() => {
    const totalSteps = roadmap?.steps?.length || 0;
    const completed = completedSteps.size;
    const progressPercent = getProgressPercentage(totalSteps);

    // Use real streak data
    const currentStreak = streakData?.currentStreak || 0;
    const longestStreak = streakData?.longestStreak || 0;
    const totalStudyHours = Math.floor((stats?.totalDaysActive || 0) * 0.5); // Estimate 30 min per day

    return {
      totalSteps,
      completed,
      progressPercent,
      currentStreak,
      longestStreak,
      totalStudyHours,
    };
  }, [
    roadmap,
    completedSteps,
    getProgressPercentage,
    streakData,
    stats,
  ]);

  // Mock activity data for last 7 days
  const recentActivity = useMemo(() => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day, index) => ({
      day,
      completed: index < 5 ? Math.floor(Math.random() * 3) + 1 : 0,
    }));
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          {showKorean ? "로딩 중..." : "Loading..."}
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-border/40 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">
            {showKorean ? "내 대시보드" : "My Dashboard"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {showKorean
              ? "학습 진행 상황과 성취를 확인하세요"
              : "Track your learning progress and achievements"}
          </p>
        </div>
      </section>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Progress */}
          <div className="border border-border/40 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {showKorean ? "진행률" : "Progress"}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {calculatedStats.progressPercent}%
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {calculatedStats.completed} / {calculatedStats.totalSteps}{" "}
              {showKorean ? "단계" : "steps"}
            </p>
          </div>

          {/* Current Streak */}
          <div className="border border-border/40 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Flame className="w-6 h-6 text-orange-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {showKorean ? "현재 연속" : "Current Streak"}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {calculatedStats.currentStreak} {showKorean ? "일" : "days"}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {showKorean ? "최장 연속:" : "Longest:"} {calculatedStats.longestStreak}{" "}
              {showKorean ? "일" : "days"}
            </p>
          </div>

          {/* Watchlist */}
          <div className="border border-border/40 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {showKorean ? "관심 목록" : "Watchlist"}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {watchlistCount}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {showKorean ? "북마크된 자료" : "saved resources"}
            </p>
          </div>

          {/* Study Time */}
          <div className="border border-border/40 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Clock className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">
                  {showKorean ? "학습 시간" : "Study Time"}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {calculatedStats.totalStudyHours}h
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {showKorean ? "총 학습 시간" : "total hours"}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left column - Activity & Achievements */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Activity */}
            <div className="border border-border/40 rounded-lg p-6">
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Calendar className="w-6 h-6" />
                {showKorean ? "최근 활동" : "Recent Activity"}
              </h2>
              <div className="flex items-end justify-between gap-2 h-32">
                {recentActivity.map((item, index) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center gap-2"
                  >
                    <div
                      className="w-full bg-foreground rounded-t transition-all"
                      style={{
                        height: `${(item.completed / 3) * 100}%`,
                        minHeight: item.completed > 0 ? "20%" : "0%",
                      }}
                    />
                    <span className="text-xs text-muted-foreground">
                      {item.day}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Achievements */}
            <div className="border border-border/40 rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                  <Trophy className="w-6 h-6" />
                  {showKorean ? "업적" : "Achievements"}
                </h2>
                <button
                  onClick={() => setShowAchievementsModal(true)}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors"
                >
                  <Sparkles className="w-4 h-4" />
                  {showKorean ? "모두 보기" : "View All"}
                </button>
              </div>

              {achievements.length === 0 ? (
                <div className="text-center py-8">
                  <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    {showKorean ? "업적을 로드하는 중..." : "Loading achievements..."}
                  </p>
                </div>
              ) : (
                <>
                  {/* Top unlocked achievements */}
                  <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-4">
                    {achievements
                      .filter(a => a.unlocked)
                      .slice(0, 6)
                      .map((achievement) => (
                        <AchievementBadge
                          key={achievement.id}
                          achievement={achievement}
                          size="medium"
                          onClick={() => setShowAchievementsModal(true)}
                        />
                      ))}
                    {achievements.filter(a => a.unlocked).length === 0 && (
                      <div className="col-span-full text-center py-4 text-sm text-muted-foreground">
                        {showKorean
                          ? "아직 업적을 달성하지 못했습니다. 계속 학습하세요!"
                          : "No achievements unlocked yet. Keep learning!"}
                      </div>
                    )}
                  </div>

                  {/* Progress stats */}
                  <div className="flex items-center justify-between pt-4 border-t border-border/40 text-sm">
                    <span className="text-muted-foreground">
                      {showKorean ? "달성률" : "Completion"}
                    </span>
                    <span className="font-medium text-foreground">
                      {achievements.filter(a => a.unlocked).length} / {achievements.length}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Right column - Quick Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="border border-border/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {showKorean ? "빠른 실행" : "Quick Actions"}
              </h3>
              <div className="space-y-3">
                <button
                  onClick={() => router.push("/roadmap")}
                  className="w-full px-4 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
                >
                  {showKorean ? "로드맵 계속하기" : "Continue Roadmap"}
                </button>
                <button
                  onClick={() => router.push("/watchlist")}
                  className="w-full px-4 py-3 border border-border/40 rounded-lg hover:bg-muted transition-colors"
                >
                  {showKorean ? "관심 목록 보기" : "View Watchlist"}
                </button>
                <button
                  onClick={() => router.push("/search")}
                  className="w-full px-4 py-3 border border-border/40 rounded-lg hover:bg-muted transition-colors"
                >
                  {showKorean ? "자료 찾기" : "Find Resources"}
                </button>
              </div>
            </div>

            {/* Progress Summary */}
            <div className="border border-border/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {showKorean ? "진행 요약" : "Progress Summary"}
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-muted-foreground">
                      {showKorean ? "완료율" : "Completion"}
                    </span>
                    <span className="text-sm font-medium text-foreground">
                      {calculatedStats.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all duration-500"
                      style={{ width: `${calculatedStats.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {showKorean ? "완료된 단계" : "Completed steps"}
                    </span>
                    <span className="font-medium text-foreground">
                      {calculatedStats.completed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {showKorean ? "남은 단계" : "Remaining steps"}
                    </span>
                    <span className="font-medium text-foreground">
                      {calculatedStats.totalSteps - calculatedStats.completed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {showKorean ? "북마크" : "Bookmarks"}
                    </span>
                    <span className="font-medium text-foreground">
                      {watchlistCount}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements Modal */}
      <AchievementsModal
        isOpen={showAchievementsModal}
        onClose={() => setShowAchievementsModal(false)}
      />
    </div>
  );
}


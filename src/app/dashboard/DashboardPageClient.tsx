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
} from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useProgress } from "@/components/ProgressProvider";
import { useWatchlist } from "@/components/WatchlistProvider";
import type { Roadmap } from "@/types";

export default function DashboardPageClient() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { showKorean } = useLanguage();
  const { completedSteps, getProgressPercentage } = useProgress();
  const { watchlistCount } = useWatchlist();

  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);

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
    async function fetchRoadmap() {
      try {
        const response = await fetch("/api/roadmap");
        if (response.ok) {
          const data = await response.json();
          setRoadmap(data);
        }
      } catch (error) {
        console.error("Failed to fetch roadmap:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchRoadmap();
  }, []);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalSteps = roadmap?.steps?.length || 0;
    const completed = completedSteps.size;
    const progressPercent = getProgressPercentage(totalSteps);

    // Mock data for streak (will be replaced with real data)
    const currentStreak = 7;
    const longestStreak = 14;
    const totalStudyHours = 42;

    // Calculate achievements
    const achievements = [
      {
        id: "first-step",
        icon: Trophy,
        title: showKorean ? "첫 걸음" : "First Step",
        description: showKorean
          ? "첫 번째 단계 완료"
          : "Complete your first step",
        unlocked: completed >= 1,
        color: "text-yellow-500",
      },
      {
        id: "milestone-5",
        icon: Star,
        title: showKorean ? "5단계 달성" : "5 Steps Milestone",
        description: showKorean ? "5개 단계 완료" : "Complete 5 steps",
        unlocked: completed >= 5,
        color: "text-blue-500",
      },
      {
        id: "halfway",
        icon: Target,
        title: showKorean ? "절반 완료" : "Halfway There",
        description: showKorean ? "로드맵 50% 완료" : "Complete 50% of roadmap",
        unlocked: progressPercent >= 50,
        color: "text-purple-500",
      },
      {
        id: "week-streak",
        icon: Flame,
        title: showKorean ? "일주일 연속" : "Week Streak",
        description: showKorean ? "7일 연속 학습" : "Study for 7 days in a row",
        unlocked: currentStreak >= 7,
        color: "text-orange-500",
      },
      {
        id: "bookworm",
        icon: BookOpen,
        title: showKorean ? "책벌레" : "Bookworm",
        description: showKorean ? "10개 이상 북마크" : "Bookmark 10+ resources",
        unlocked: watchlistCount >= 10,
        color: "text-green-500",
      },
      {
        id: "master",
        icon: Award,
        title: showKorean ? "마스터" : "Master",
        description: showKorean
          ? "모든 단계 완료"
          : "Complete all roadmap steps",
        unlocked: totalSteps > 0 && completed === totalSteps,
        color: "text-red-500",
      },
    ];

    return {
      totalSteps,
      completed,
      progressPercent,
      currentStreak,
      longestStreak,
      totalStudyHours,
      achievements,
    };
  }, [
    roadmap,
    completedSteps,
    getProgressPercentage,
    watchlistCount,
    showKorean,
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
                  {stats.progressPercent}%
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.completed} / {stats.totalSteps}{" "}
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
                  {stats.currentStreak} {showKorean ? "일" : "days"}
                </p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              {showKorean ? "최장 연속:" : "Longest:"} {stats.longestStreak}{" "}
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
                  {stats.totalStudyHours}h
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
              <h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                <Trophy className="w-6 h-6" />
                {showKorean ? "성취" : "Achievements"}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {stats.achievements.map((achievement) => (
                  <div
                    key={achievement.id}
                    className={`border border-border/40 rounded-lg p-4 transition-all ${
                      achievement.unlocked ? "opacity-100" : "opacity-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-full bg-muted flex items-center justify-center flex-shrink-0 ${
                          achievement.unlocked ? achievement.color : ""
                        }`}
                      >
                        <achievement.icon
                          className={`w-5 h-5 ${
                            achievement.unlocked
                              ? achievement.color
                              : "text-muted-foreground"
                          }`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-foreground mb-1">
                          {achievement.title}
                        </h3>
                        <p className="text-xs text-muted-foreground">
                          {achievement.description}
                        </p>
                        {achievement.unlocked && (
                          <div className="flex items-center gap-1 mt-2">
                            <CheckCircle2 className="w-3 h-3 text-green-500" />
                            <span className="text-xs text-green-500 font-medium">
                              {showKorean ? "달성" : "Unlocked"}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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
                      {stats.progressPercent}%
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-foreground transition-all duration-500"
                      style={{ width: `${stats.progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-border/40 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {showKorean ? "완료된 단계" : "Completed steps"}
                    </span>
                    <span className="font-medium text-foreground">
                      {stats.completed}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">
                      {showKorean ? "남은 단계" : "Remaining steps"}
                    </span>
                    <span className="font-medium text-foreground">
                      {stats.totalSteps - stats.completed}
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
    </div>
  );
}


"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Trophy, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import VisualRoadmap from "@/components/VisualRoadmap";
import type { Roadmap } from "@/types";
import { useProgress } from "@/components/ProgressProvider";
import { useLanguage } from "@/components/LanguageProvider";

export default function RoadmapPageClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showKorean } = useLanguage();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getProgressPercentage, isStepCompleted } = useProgress();

  useEffect(() => {
    async function fetchRoadmap() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/roadmap");
        if (!response.ok) {
          throw new Error("Failed to fetch roadmap");
        }
        const data = await response.json();
        setRoadmap(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load roadmap");
      } finally {
        setIsLoading(false);
      }
    }
    
    if (status === "authenticated") {
      fetchRoadmap();
    }
  }, [status]);

  // Check authentication status after hooks are declared
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
              ? "로드맵 기능을 사용하려면 Google 계정으로 로그인해주세요. 진행 상황이 모든 기기에 동기화됩니다."
              : "Please sign in with your Google account to access the roadmap feature. Your progress will be synced across all devices."}
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

  // Handle error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-foreground text-background rounded-lg"
          >
            {showKorean ? "다시 시도" : "Retry"}
          </button>
        </div>
      </div>
    );
  }

  // Handle loading state
  if (isLoading || !roadmap) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          {showKorean ? "로딩 중..." : "Loading..."}
        </p>
      </div>
    );
  }

  const totalSteps = roadmap?.steps?.length || 0;
  const progressPercentage = getProgressPercentage(totalSteps);
  const completedSteps =
    roadmap.steps?.filter((step) => isStepCompleted(step.id)).length || 0;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-border/40 py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {showKorean ? "한국어 학습 로드맵" : "Korean Learning Roadmap"}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {showKorean
                ? "체계적인 학습 경로를 따라 한국어를 마스터하세요. 각 단계를 클릭하여 자세한 내용과 자료를 확인하세요."
                : "Follow this structured path to master Korean. Click each step to view details and resources."}
            </p>
          </div>

          {/* Progress Stats */}
          <div className="flex items-center justify-center gap-8 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {completedSteps}/{totalSteps}
                </div>
                <div className="text-sm text-muted-foreground">
                  {showKorean ? "완료된 단계" : "Steps Complete"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <Trophy className="w-6 h-6 text-foreground" />
              </div>
              <div>
                <div className="text-2xl font-bold text-foreground">
                  {progressPercentage}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {showKorean ? "진행률" : "Progress"}
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-8 max-w-md mx-auto">
            <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-foreground transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Visual Roadmap */}
      <section className="py-12 px-6">
        <div className="max-w-7xl mx-auto">
          <VisualRoadmap roadmap={roadmap} />
        </div>
      </section>
    </div>
  );
}

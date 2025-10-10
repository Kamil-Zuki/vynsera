"use client";

import { useState, useEffect } from "react";
import { CheckCircle } from "lucide-react";
import RoadmapAccordion from "@/components/RoadmapAccordion";
import type { Roadmap } from "@/types";
import { useProgress } from "@/components/ProgressProvider";
import { useLanguage } from "@/components/LanguageProvider";

export default function RoadmapPageClient() {
  const { showKorean } = useLanguage();
  const [roadmap, setRoadmap] = useState<Roadmap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getProgressPercentage } = useProgress();

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
    fetchRoadmap();
  }, []);

  const totalSteps = roadmap?.steps?.length || 0;
  const progressPercentage = getProgressPercentage(totalSteps);

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

  if (isLoading || !roadmap) {
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
      <section className="border-b border-border/40 py-16 px-6">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {showKorean ? "학습 로드맵" : "Learning Roadmap"}
          </h1>
          <p className="text-lg text-muted-foreground mb-6">
            {showKorean
              ? "초급부터 고급까지 구조화된 한국어 학습 경로"
              : "Your structured path from beginner to advanced Korean"}
          </p>

          {/* Progress */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CheckCircle className="w-4 h-4" />
              <span>
                {progressPercentage}% {showKorean ? "완료" : "complete"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Steps */}
      <section className="py-12 px-6">
        <div className="max-w-4xl mx-auto">
          <RoadmapAccordion roadmap={roadmap} />
        </div>
      </section>
    </div>
  );
}

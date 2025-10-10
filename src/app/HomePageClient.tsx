"use client";

import Link from "next/link";
import { ArrowRight, BookOpen, Map, Bookmark } from "lucide-react";
import { useLanguage } from "@/components/LanguageProvider";
import { useWatchlist } from "@/components/WatchlistProvider";

export default function HomePageClient() {
  const { showKorean } = useLanguage();
  const { watchlistCount } = useWatchlist();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6 tracking-tight">
            {showKorean ? "한국어를 배우세요" : "Learn Korean"}
          </h1>
          <p className="text-xl text-muted-foreground mb-12 leading-relaxed">
            {showKorean
              ? "체계적인 로드맵과 선별된 자료로 유창함을 향한 여정을 시작하세요"
              : "Start your journey to fluency with structured roadmaps and curated resources"}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/roadmap"
              className="inline-flex items-center justify-center gap-2 bg-foreground text-background px-8 py-4 rounded-lg font-medium transition-opacity hover:opacity-90"
            >
              {showKorean ? "학습 시작하기" : "Start Learning"}
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/search"
              className="inline-flex items-center justify-center gap-2 border border-border text-foreground px-8 py-4 rounded-lg font-medium transition-colors hover:bg-muted/50"
            >
              {showKorean ? "자료 검색하기" : "Browse Resources"}
              <BookOpen className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Simple Stats */}
      <section className="border-t border-border/40 py-16 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 text-center">
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">79+</div>
              <div className="text-sm text-muted-foreground">
                {showKorean ? "학습 자료" : "Learning Resources"}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">12</div>
              <div className="text-sm text-muted-foreground">
                {showKorean ? "학습 단계" : "Learning Steps"}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">
                {watchlistCount}
              </div>
              <div className="text-sm text-muted-foreground">
                {showKorean ? "저장된 자료" : "Saved Resources"}
              </div>
            </div>
            <div>
              <div className="text-4xl font-bold text-foreground mb-2">
                90%+
              </div>
              <div className="text-sm text-muted-foreground">
                {showKorean ? "무료 자료" : "Free Resources"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Three Column Feature */}
      <section className="py-16 px-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <Link href="/roadmap" className="group">
            <div className="border border-border/40 rounded-lg p-8 transition-all hover:border-foreground/20">
              <Map className="w-8 h-8 text-foreground mb-4" />
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                {showKorean ? "학습 로드맵" : "Learning Roadmap"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {showKorean
                  ? "초급부터 고급까지 구조화된 학습 경로를 따라가세요"
                  : "Follow a structured learning path from beginner to advanced"}
              </p>
              <span className="text-sm text-foreground group-hover:underline">
                {showKorean ? "로드맵 보기" : "View Roadmap"} →
              </span>
            </div>
          </Link>

          <Link href="/search" className="group">
            <div className="border border-border/40 rounded-lg p-8 transition-all hover:border-foreground/20">
              <BookOpen className="w-8 h-8 text-foreground mb-4" />
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                {showKorean ? "자료 검색" : "Browse Resources"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {showKorean
                  ? "79개 이상의 선별된 한국어 학습 자료를 탐색하세요"
                  : "Explore 79+ curated Korean learning resources"}
              </p>
              <span className="text-sm text-foreground group-hover:underline">
                {showKorean ? "자료 검색" : "Search Resources"} →
              </span>
            </div>
          </Link>

          <Link href="/watchlist" className="group">
            <div className="border border-border/40 rounded-lg p-8 transition-all hover:border-foreground/20">
              <Bookmark className="w-8 h-8 text-foreground mb-4" />
              <h3 className="text-2xl font-semibold text-foreground mb-3">
                {showKorean ? "내 관심 목록" : "My Watchlist"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {showKorean
                  ? "저장된 자료를 확인하고 학습 계획을 세우세요"
                  : "View your saved resources and plan your learning"}
              </p>
              <span className="text-sm text-foreground group-hover:underline">
                {showKorean ? "관심 목록 보기" : "View Watchlist"} →
              </span>
            </div>
          </Link>
        </div>
      </section>
    </div>
  );
}

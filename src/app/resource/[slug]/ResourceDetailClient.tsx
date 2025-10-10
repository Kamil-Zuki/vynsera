"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  ExternalLink,
  Bookmark,
  Star,
  ThumbsUp,
  ThumbsDown,
  ArrowLeft,
  Clock,
  Globe,
  DollarSign,
  Award,
} from "lucide-react";
import type { Resource } from "@/types";
import { useLanguage } from "@/components/LanguageProvider";
import { useWatchlist } from "@/components/WatchlistProvider";

interface ResourceDetailClientProps {
  slug: string;
}

export default function ResourceDetailClient({
  slug,
}: ResourceDetailClientProps) {
  const router = useRouter();
  const { status } = useSession();
  const { showKorean } = useLanguage();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();

  const [resource, setResource] = useState<Resource | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isAuthenticated = status === "authenticated";
  const inWatchlist = resource ? isInWatchlist(resource.id) : false;

  useEffect(() => {
    async function fetchResource() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/resources");
        if (!response.ok) {
          throw new Error("Failed to fetch resources");
        }
        const allResources = await response.json();
        const found = allResources.find((r: Resource) => r.slug === slug);

        if (!found) {
          setError("Resource not found");
        } else {
          setResource(found);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load resource"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchResource();
  }, [slug]);

  const handleWatchlistClick = () => {
    if (!resource) return;
    if (inWatchlist) {
      removeFromWatchlist(resource.id);
    } else {
      addToWatchlist(resource.id);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">
          {showKorean ? "로딩 중..." : "Loading..."}
        </p>
      </div>
    );
  }

  if (error || !resource) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            {error ||
              (showKorean ? "리소스를 찾을 수 없습니다" : "Resource not found")}
          </p>
          <button
            onClick={() => router.push("/search")}
            className="px-4 py-2 bg-foreground text-background rounded-lg"
          >
            {showKorean ? "검색으로 돌아가기" : "Back to Search"}
          </button>
        </div>
      </div>
    );
  }

  const getCategoryLabel = (category: string) => {
    const categoryMap: Record<string, { en: string; ko: string }> = {
      Video: { en: "Video", ko: "비디오" },
      Website: { en: "Website", ko: "웹사이트" },
      Tool: { en: "Tool", ko: "도구" },
      Podcast: { en: "Podcast", ko: "팟캐스트" },
      Book: { en: "Book", ko: "책" },
      Course: { en: "Course", ko: "과정" },
      App: { en: "App", ko: "앱" },
    };
    return showKorean
      ? categoryMap[category]?.ko || category
      : categoryMap[category]?.en || category;
  };

  const getLevelLabel = (level: string) => {
    const levelMap: Record<string, { en: string; ko: string }> = {
      Beginner: { en: "Beginner", ko: "초급" },
      Intermediate: { en: "Intermediate", ko: "중급" },
      Advanced: { en: "Advanced", ko: "고급" },
    };
    return showKorean
      ? levelMap[level]?.ko || level
      : levelMap[level]?.en || level;
  };

  // Mock data for reviews and ratings (will be replaced with real data later)
  const mockRating = resource.rating || 4.5;
  const mockReviewCount = 127;

  return (
    <div className="min-h-screen">
      {/* Header with back button */}
      <div className="border-b border-border/40 py-6 px-6">
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {showKorean ? "뒤로 가기" : "Back"}
          </button>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left column - Main info */}
          <div className="lg:col-span-2 space-y-8">
            {/* Title and meta */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h1 className="text-4xl font-bold text-foreground mb-2">
                    {showKorean && resource.titleKorean
                      ? resource.titleKorean
                      : resource.title}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                    <span className="px-3 py-1 bg-muted rounded-full">
                      {getCategoryLabel(resource.category)}
                    </span>
                    <span className="px-3 py-1 bg-muted rounded-full">
                      {getLevelLabel(resource.level)}
                    </span>
                    {!resource.isFree && (
                      <span className="px-3 py-1 bg-muted rounded-full flex items-center gap-1">
                        <DollarSign className="w-3 h-3" />
                        {showKorean ? "유료" : "Paid"}
                      </span>
                    )}
                    <span className="px-3 py-1 bg-muted rounded-full flex items-center gap-1">
                      <Globe className="w-3 h-3" />
                      {resource.language}
                    </span>
                  </div>
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-4 mb-6">
                <div className="flex items-center gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-5 h-5 ${
                        i < Math.floor(mockRating)
                          ? "fill-yellow-500 text-yellow-500"
                          : "text-muted-foreground/30"
                      }`}
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold text-foreground">
                  {mockRating.toFixed(1)}
                </span>
                <span className="text-sm text-muted-foreground">
                  ({mockReviewCount} {showKorean ? "리뷰" : "reviews"})
                </span>
              </div>

              {/* Description */}
              <p className="text-lg text-muted-foreground leading-relaxed">
                {showKorean && resource.descriptionKorean
                  ? resource.descriptionKorean
                  : resource.description}
              </p>
            </div>

            {/* Features */}
            {resource.features && resource.features.length > 0 && (
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-4">
                  {showKorean ? "주요 기능" : "Key Features"}
                </h2>
                <ul className="space-y-3">
                  {resource.features.map((feature, index) => (
                    <li
                      key={index}
                      className="flex items-start gap-3 text-muted-foreground"
                    >
                      <Award className="w-5 h-5 text-foreground flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Pros and Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-border/40 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ThumbsUp className="w-5 h-5 text-green-500" />
                  {showKorean ? "장점" : "Pros"}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    • {showKorean ? "고품질 콘텐츠" : "High-quality content"}
                  </li>
                  <li>• {showKorean ? "체계적인 구조" : "Well-structured"}</li>
                  <li>• {showKorean ? "정기 업데이트" : "Regular updates"}</li>
                  <li>
                    • {showKorean ? "초보자 친화적" : "Beginner-friendly"}
                  </li>
                </ul>
              </div>

              <div className="border border-border/40 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ThumbsDown className="w-5 h-5 text-red-500" />
                  {showKorean ? "단점" : "Cons"}
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li>
                    •{" "}
                    {showKorean
                      ? "일부 고급 기능 유료"
                      : "Some features are paid"}
                  </li>
                  <li>
                    •{" "}
                    {showKorean
                      ? "영어로만 제공될 수 있음"
                      : "May be English-only"}
                  </li>
                  <li>
                    •{" "}
                    {showKorean ? "시간 투자 필요" : "Requires time commitment"}
                  </li>
                </ul>
              </div>
            </div>

            {/* Tags */}
            {resource.tags && resource.tags.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  {showKorean ? "관련 주제" : "Related Topics"}
                </h3>
                <div className="flex flex-wrap gap-2">
                  {resource.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-4 py-2 bg-muted text-muted-foreground rounded-lg text-sm hover:bg-muted/80 transition-colors cursor-pointer"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Sidebar */}
          <div className="space-y-6">
            {/* Action buttons */}
            <div className="border border-border/40 rounded-lg p-6 space-y-4 sticky top-6">
              <a
                href={resource.link}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-foreground text-background rounded-lg hover:bg-foreground/90 transition-colors font-medium"
              >
                {showKorean ? "리소스 방문" : "Visit Resource"}
                <ExternalLink className="w-4 h-4" />
              </a>

              {isAuthenticated && (
                <button
                  onClick={handleWatchlistClick}
                  className={`w-full flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-colors font-medium ${
                    inWatchlist
                      ? "bg-primary text-primary-foreground hover:bg-primary/90"
                      : "border border-border/40 hover:bg-muted"
                  }`}
                >
                  <Bookmark
                    className={`w-4 h-4 ${inWatchlist ? "fill-current" : ""}`}
                  />
                  {inWatchlist
                    ? showKorean
                      ? "관심 목록에서 제거"
                      : "Remove from Watchlist"
                    : showKorean
                    ? "관심 목록에 추가"
                    : "Add to Watchlist"}
                </button>
              )}

              {!isAuthenticated && (
                <button
                  onClick={() => router.push("/auth/signin")}
                  className="w-full flex items-center justify-center gap-2 px-6 py-3 border border-border/40 rounded-lg hover:bg-muted transition-colors font-medium text-muted-foreground"
                >
                  <Bookmark className="w-4 h-4" />
                  {showKorean ? "로그인하여 저장" : "Sign in to Save"}
                </button>
              )}

              {/* Quick stats */}
              <div className="pt-4 border-t border-border/40 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {showKorean ? "평점" : "Rating"}
                  </span>
                  <span className="font-medium text-foreground">
                    {mockRating.toFixed(1)}/5.0
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {showKorean ? "리뷰" : "Reviews"}
                  </span>
                  <span className="font-medium text-foreground">
                    {mockReviewCount}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {showKorean ? "난이도" : "Level"}
                  </span>
                  <span className="font-medium text-foreground">
                    {getLevelLabel(resource.level)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {showKorean ? "가격" : "Price"}
                  </span>
                  <span className="font-medium text-foreground">
                    {resource.isFree
                      ? showKorean
                        ? "무료"
                        : "Free"
                      : showKorean
                      ? "유료"
                      : "Paid"}
                  </span>
                </div>
              </div>
            </div>

            {/* Best for */}
            <div className="border border-border/40 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {showKorean ? "적합한 학습자" : "Best For"}
              </h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  •{" "}
                  {showKorean
                    ? "한국어를 처음 배우는 학습자"
                    : "Beginners starting Korean"}
                </li>
                <li>
                  •{" "}
                  {showKorean
                    ? "체계적인 학습을 원하는 사람"
                    : "Structured learners"}
                </li>
                <li>
                  • {showKorean ? "자기 주도 학습자" : "Self-directed students"}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


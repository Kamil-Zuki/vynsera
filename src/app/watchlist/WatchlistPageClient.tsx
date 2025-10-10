"use client";

import { useState, useEffect } from "react";
import { Bookmark, Trash2, Lock } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import ResourceCard from "@/components/ResourceCard";
import type { Resource } from "@/types";
import { useLanguage } from "@/components/LanguageProvider";
import { useWatchlist } from "@/components/WatchlistProvider";
import Link from "next/link";

export default function WatchlistPageClient() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { showKorean } = useLanguage();
  const { watchlist, watchlistCount } = useWatchlist();
  const [watchlistResources, setWatchlistResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
              ? "관심 목록을 사용하려면 Google 계정으로 로그인해주세요. 북마크가 모든 기기에 동기화됩니다."
              : "Please sign in with your Google account to access your watchlist. Your bookmarks will be synced across all devices."}
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
    async function fetchWatchlistResources() {
      if (watchlist.length === 0) {
        setWatchlistResources([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const response = await fetch("/api/resources");
        if (!response.ok) {
          throw new Error("Failed to fetch resources");
        }
        const allResources = await response.json();
        const filtered = allResources.filter((r: Resource) =>
          watchlist.includes(r.id)
        );
        setWatchlistResources(filtered);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load watchlist"
        );
      } finally {
        setIsLoading(false);
      }
    }

    fetchWatchlistResources();
  }, [watchlist]);

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

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="border-b border-border/40 py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center mb-4">
            <Bookmark className="w-12 h-12 text-foreground" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {showKorean ? "내 관심 목록" : "My Watchlist"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {showKorean
              ? `저장된 자료 ${watchlistCount}개`
              : `${watchlistCount} saved resources`}
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="text-center py-24">
              <p className="text-muted-foreground">
                {showKorean ? "로딩 중..." : "Loading..."}
              </p>
            </div>
          ) : watchlistResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {watchlistResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-24">
              <Bookmark className="w-16 h-16 text-muted-foreground mx-auto mb-6" />
              <h2 className="text-2xl font-semibold text-foreground mb-4">
                {showKorean
                  ? "관심 목록이 비어있습니다"
                  : "Your watchlist is empty"}
              </h2>
              <p className="text-muted-foreground mb-8 max-w-md mx-auto">
                {showKorean
                  ? "자료를 탐색하고 북마크 버튼을 클릭하여 나중에 볼 수 있도록 저장하세요."
                  : "Browse resources and click the bookmark button to save them for later."}
              </p>
              <Link
                href="/search"
                className="inline-flex items-center gap-2 bg-foreground text-background px-6 py-3 rounded-lg font-medium transition-opacity hover:opacity-90"
              >
                {showKorean ? "자료 탐색하기" : "Browse Resources"}
              </Link>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

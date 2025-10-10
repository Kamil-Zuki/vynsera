"use client";

import Image from "next/image";
import { ExternalLink, Bookmark } from "lucide-react";
import type { Resource } from "@/types";
import { useLanguage } from "./LanguageProvider";
import { useWatchlist } from "./WatchlistProvider";

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const { showKorean } = useLanguage();
  const { isInWatchlist, addToWatchlist, removeFromWatchlist } = useWatchlist();
  const inWatchlist = isInWatchlist(resource.id);

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (inWatchlist) {
      removeFromWatchlist(resource.id);
    } else {
      addToWatchlist(resource.id);
    }
  };

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

  return (
    <a
      href={resource.link}
      target="_blank"
      rel="noopener noreferrer"
      className="group block border border-border/40 rounded-lg p-6 transition-all hover:border-foreground/20"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-foreground mb-1 group-hover:underline">
            {showKorean && resource.titleKorean
              ? resource.titleKorean
              : resource.title}
          </h3>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span>{getCategoryLabel(resource.category)}</span>
            <span>·</span>
            <span>{getLevelLabel(resource.level)}</span>
            {!resource.isFree && (
              <>
                <span>·</span>
                <span>{showKorean ? "유료" : "Paid"}</span>
              </>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleWatchlistClick}
            className={`p-2 rounded-lg transition-colors ${
              inWatchlist
                ? "bg-primary text-primary-foreground"
                : "hover:bg-muted"
            }`}
            title={
              inWatchlist
                ? showKorean
                  ? "관심 목록에서 제거"
                  : "Remove from watchlist"
                : showKorean
                ? "관심 목록에 추가"
                : "Add to watchlist"
            }
          >
            <Bookmark
              className={`w-4 h-4 ${inWatchlist ? "fill-current" : ""}`}
            />
          </button>
          <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-muted-foreground line-clamp-2">
        {showKorean && resource.descriptionKorean
          ? resource.descriptionKorean
          : resource.description}
      </p>

      {/* Tags */}
      {resource.tags && resource.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-4">
          {resource.tags.slice(0, 3).map((tag, index) => (
            <span
              key={index}
              className="px-2 py-1 text-xs bg-muted/50 text-muted-foreground rounded"
            >
              {tag}
            </span>
          ))}
        </div>
      )}
    </a>
  );
};

export default ResourceCard;

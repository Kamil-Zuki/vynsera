"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  X,
  BookOpen,
  Heart,
  Play,
  Globe,
  Mic,
  GraduationCap,
  Wrench,
} from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import type { Resource, SearchFilters } from "@/types";
import resourcesData from "@/data/resources.json";
import { useLanguage } from "@/components/LanguageProvider";

export default function SearchPageClient() {
  const { showKorean } = useLanguage();
  const allResources: Resource[] = resourcesData as Resource[];

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const categories = [
    { value: "App", label: "App", labelKorean: "앱", icon: Heart },
    { value: "Book", label: "Book", labelKorean: "책", icon: BookOpen },
    { value: "Video", label: "Video", labelKorean: "비디오", icon: Play },
    {
      value: "Website",
      label: "Website",
      labelKorean: "웹사이트",
      icon: Globe,
    },
    { value: "Podcast", label: "Podcast", labelKorean: "팟캐스트", icon: Mic },
    {
      value: "Course",
      label: "Course",
      labelKorean: "과정",
      icon: GraduationCap,
    },
    { value: "Tool", label: "Tool", labelKorean: "도구", icon: Wrench },
  ];

  const levels = [
    { value: "Beginner", label: "Beginner", labelKorean: "초급" },
    { value: "Intermediate", label: "Intermediate", labelKorean: "중급" },
    { value: "Advanced", label: "Advanced", labelKorean: "고급" },
  ];

  const languages = [
    { value: "English", label: "English", labelKorean: "영어" },
    { value: "Korean", label: "Korean", labelKorean: "한국어" },
    { value: "Bilingual", label: "Bilingual", labelKorean: "이중 언어" },
  ];

  // Filter and search logic
  const filteredResources = useMemo(() => {
    return allResources.filter((resource) => {
      // Search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = resource.title.toLowerCase().includes(query);
        const matchesDescription = resource.description
          .toLowerCase()
          .includes(query);
        const matchesTags = resource.tags.some((tag) =>
          tag.toLowerCase().includes(query)
        );
        const matchesKoreanTitle = resource.titleKorean
          ?.toLowerCase()
          .includes(query);
        const matchesKoreanDescription = resource.descriptionKorean
          ?.toLowerCase()
          .includes(query);

        if (
          !matchesTitle &&
          !matchesDescription &&
          !matchesTags &&
          !matchesKoreanTitle &&
          !matchesKoreanDescription
        ) {
          return false;
        }
      }

      // Level filter
      if (filters.level && resource.level !== filters.level) {
        return false;
      }

      // Category filter
      if (filters.category && resource.category !== filters.category) {
        return false;
      }

      // Language filter
      if (filters.language && resource.language !== filters.language) {
        return false;
      }

      // Free filter
      if (filters.isFree !== undefined && resource.isFree !== filters.isFree) {
        return false;
      }

      // Tags filter
      if (filters.tags && filters.tags.length > 0) {
        const hasMatchingTag = filters.tags.some((tag) =>
          resource.tags.some((resourceTag) =>
            resourceTag.toLowerCase().includes(tag.toLowerCase())
          )
        );
        if (!hasMatchingTag) {
          return false;
        }
      }

      return true;
    });
  }, [allResources, searchQuery, filters]);

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const hasActiveFilters =
    Object.keys(filters).length > 0 || searchQuery.length > 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              {showKorean
                ? "한국어 학습 자료 검색"
                : "Search Korean Learning Resources"}
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              {showKorean
                ? "레벨, 카테고리, 언어별로 한국어 학습 자료를 검색하고 필터링하세요. 당신의 한국어 학습 여정에 완벽한 자료를 찾아보세요."
                : "Search and filter Korean learning resources by level, category, language, and more. Find the perfect resources for your Korean learning journey."}
            </p>
          </div>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 max-w-2xl">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder={
                  showKorean ? "자료 검색..." : "Search resources..."
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Filter Toggle */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-background text-foreground hover:bg-primary/10 transition-colors focus-ring"
              >
                <Filter className="w-4 h-4" />
                {showKorean ? "필터" : "Filters"}
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-primary rounded-full"></span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-muted-foreground hover:text-foreground transition-colors focus-ring"
                >
                  {showKorean ? "필터 지우기" : "Clear Filters"}
                </button>
              )}
            </div>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="mt-6 p-6 bg-background border border-border rounded-lg">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {showKorean ? "레벨" : "Level"}
                  </label>
                  <select
                    value={filters.level || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        level: (e.target.value as any) || undefined,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">
                      {showKorean ? "모든 레벨" : "All Levels"}
                    </option>
                    {levels.map((level) => (
                      <option key={level.value} value={level.value}>
                        {showKorean && level.labelKorean
                          ? level.labelKorean
                          : level.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {showKorean ? "카테고리" : "Category"}
                  </label>
                  <select
                    value={filters.category || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        category: e.target.value || undefined,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">
                      {showKorean ? "모든 카테고리" : "All Categories"}
                    </option>
                    {categories.map((category) => (
                      <option key={category.value} value={category.value}>
                        {showKorean && category.labelKorean
                          ? category.labelKorean
                          : category.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Language Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {showKorean ? "언어" : "Language"}
                  </label>
                  <select
                    value={filters.language || ""}
                    onChange={(e) =>
                      setFilters((prev) => ({
                        ...prev,
                        language: (e.target.value as any) || undefined,
                      }))
                    }
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">
                      {showKorean ? "모든 언어" : "All Languages"}
                    </option>
                    {languages.map((language) => (
                      <option key={language.value} value={language.value}>
                        {showKorean && language.labelKorean
                          ? language.labelKorean
                          : language.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Free Filter */}
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    {showKorean ? "가격" : "Price"}
                  </label>
                  <select
                    value={
                      filters.isFree === undefined
                        ? ""
                        : filters.isFree
                        ? "free"
                        : "paid"
                    }
                    onChange={(e) => {
                      const value = e.target.value;
                      setFilters((prev) => ({
                        ...prev,
                        isFree: value === "" ? undefined : value === "free",
                      }));
                    }}
                    className="w-full px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="">
                      {showKorean ? "모든 가격" : "All Prices"}
                    </option>
                    <option value="free">{showKorean ? "무료" : "Free"}</option>
                    <option value="paid">{showKorean ? "유료" : "Paid"}</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Results */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Info */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-muted-foreground">
              {showKorean
                ? `${filteredResources.length}개의 자료 표시 중`
                : `Showing ${filteredResources.length} resources`}
              {hasActiveFilters && (
                <span className="ml-2 text-sm">
                  ({showKorean ? "필터 적용됨" : "filtered"})
                </span>
              )}
            </div>

            {filteredResources.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {showKorean ? "정렬:" : "Sort by:"}
                <span className="text-foreground font-medium ml-1">
                  {showKorean ? "관련성" : "Relevance"}
                </span>
              </div>
            )}
          </div>

          {/* Results Grid */}
          {filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map((resource) => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">
                {showKorean ? "검색 결과가 없습니다" : "No results found"}
              </h3>
              <p className="text-muted-foreground mb-6">
                {showKorean
                  ? "다른 검색어나 필터를 시도해보세요."
                  : "Try different search terms or adjust your filters."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="px-6 py-3 bg-primary hover:bg-primary-hover text-white rounded-lg font-medium transition-colors focus-ring"
                >
                  {showKorean ? "모든 필터 지우기" : "Clear All Filters"}
                </button>
              )}
            </div>
          )}

          {/* Popular Tags */}
          {!hasActiveFilters && (
            <div className="mt-16">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                {showKorean ? "인기 태그" : "Popular Tags"}
              </h3>
              <div className="flex flex-wrap gap-2">
                {[
                  "grammar",
                  "vocabulary",
                  "pronunciation",
                  "culture",
                  "conversation",
                  "reading",
                  "listening",
                  "writing",
                ].map((tag) => (
                  <button
                    key={tag}
                    onClick={() => setSearchQuery(tag)}
                    className="px-3 py-1 bg-secondary/20 text-secondary-foreground rounded-full text-sm hover:bg-secondary/30 transition-colors focus-ring"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

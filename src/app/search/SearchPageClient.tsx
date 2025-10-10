"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { Search, X, TrendingUp } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import type { Resource, SearchFilters } from "@/types";
import { useLanguage } from "@/components/LanguageProvider";

export default function SearchPageClient() {
  const { showKorean } = useLanguage();
  const [allResources, setAllResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({});
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchResources() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/resources");
        if (!response.ok) {
          throw new Error("Failed to fetch resources");
        }
        const data = await response.json();
        setAllResources(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load resources"
        );
      } finally {
        setIsLoading(false);
      }
    }
    fetchResources();
  }, []);

  const levels = [
    { value: "Beginner", label: "Beginner", labelKorean: "초급" },
    { value: "Intermediate", label: "Intermediate", labelKorean: "중급" },
    { value: "Advanced", label: "Advanced", labelKorean: "고급" },
  ];

  const categories = [
    { value: "Video", label: "Video", labelKorean: "비디오" },
    { value: "Website", label: "Website", labelKorean: "웹사이트" },
    { value: "Tool", label: "Tool", labelKorean: "도구" },
    { value: "Podcast", label: "Podcast", labelKorean: "팟캐스트" },
    { value: "Book", label: "Book", labelKorean: "책" },
    { value: "Course", label: "Course", labelKorean: "과정" },
    { value: "App", label: "App", labelKorean: "앱" },
  ];

  // Generate search suggestions
  const suggestions = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return [];

    const query = searchQuery.toLowerCase();
    const suggestionSet = new Set<string>();

    // Add matching resource titles
    allResources.forEach((resource) => {
      if (resource.title.toLowerCase().includes(query)) {
        suggestionSet.add(resource.title);
      }
      if (resource.titleKorean?.toLowerCase().includes(query)) {
        suggestionSet.add(resource.titleKorean);
      }
    });

    // Add matching tags
    allResources.forEach((resource) => {
      resource.tags.forEach((tag) => {
        if (tag.toLowerCase().includes(query)) {
          suggestionSet.add(tag);
        }
      });
    });

    return Array.from(suggestionSet).slice(0, 8);
  }, [searchQuery, allResources]);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions || suggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedSuggestionIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      setSearchQuery(suggestions[selectedSuggestionIndex]);
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setSelectedSuggestionIndex(-1);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    setSelectedSuggestionIndex(-1);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setShowSuggestions(value.length >= 2);
    setSelectedSuggestionIndex(-1);
  };

  // Filter and search logic
  const filteredResources = useMemo(() => {
    return allResources.filter((resource) => {
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

      if (filters.level && resource.level !== filters.level) return false;
      if (filters.category && resource.category !== filters.category)
        return false;
      if (filters.isFree !== undefined && resource.isFree !== filters.isFree)
        return false;

      return true;
    });
  }, [allResources, searchQuery, filters]);

  const clearFilters = () => {
    setFilters({});
    setSearchQuery("");
  };

  const hasActiveFilters =
    Object.keys(filters).length > 0 || searchQuery.length > 0;

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
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            {showKorean ? "자료 검색" : "Search Resources"}
          </h1>
          <p className="text-lg text-muted-foreground">
            {showKorean
              ? "79개 이상의 한국어 학습 자료를 검색하세요"
              : "Search through 79+ Korean learning resources"}
          </p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 px-6 border-b border-border/40">
        <div className="max-w-5xl mx-auto">
          {/* Search Bar */}
          <div className="relative mb-6">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={showKorean ? "자료 검색..." : "Search resources..."}
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() =>
                searchQuery.length >= 2 && setShowSuggestions(true)
              }
              className="w-full pl-12 pr-12 py-4 border border-border/40 rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:border-foreground/40 transition-colors"
              autoComplete="off"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSuggestions(false);
                }}
                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground z-10"
              >
                <X className="w-5 h-5" />
              </button>
            )}

            {/* Suggestions Dropdown */}
            {showSuggestions && suggestions.length > 0 && (
              <div
                ref={suggestionsRef}
                className="absolute top-full mt-2 w-full bg-card border border-border/40 rounded-lg shadow-lg max-h-96 overflow-y-auto z-50"
              >
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className={`w-full text-left px-4 py-3 hover:bg-muted transition-colors flex items-center gap-3 ${
                      index === selectedSuggestionIndex ? "bg-muted" : ""
                    }`}
                  >
                    <TrendingUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="text-foreground">{suggestion}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select
              value={filters.level || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  level:
                    (e.target.value as
                      | "Beginner"
                      | "Intermediate"
                      | "Advanced") || undefined,
                }))
              }
              className="px-4 py-2 border border-border/40 rounded-lg bg-background text-sm text-foreground focus:outline-none focus:border-foreground/40"
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

            <select
              value={filters.category || ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  category: e.target.value || undefined,
                }))
              }
              className="px-4 py-2 border border-border/40 rounded-lg bg-background text-sm text-foreground focus:outline-none focus:border-foreground/40"
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
              className="px-4 py-2 border border-border/40 rounded-lg bg-background text-sm text-foreground focus:outline-none focus:border-foreground/40"
            >
              <option value="">
                {showKorean ? "모든 가격" : "All Prices"}
              </option>
              <option value="free">{showKorean ? "무료" : "Free"}</option>
              <option value="paid">{showKorean ? "유료" : "Paid"}</option>
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {showKorean ? "초기화" : "Clear"}
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Results */}
      <section className="py-12 px-6">
        <div className="max-w-5xl mx-auto">
          {isLoading ? (
            <div className="text-center py-24">
              <p className="text-muted-foreground">
                {showKorean ? "로딩 중..." : "Loading..."}
              </p>
            </div>
          ) : (
            <>
              <div className="text-sm text-muted-foreground mb-8">
                {filteredResources.length} {showKorean ? "개" : "resources"}
              </div>

              {filteredResources.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredResources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-24">
                  <p className="text-muted-foreground mb-4">
                    {showKorean ? "검색 결과가 없습니다" : "No results found"}
                  </p>
                  {hasActiveFilters && (
                    <button
                      onClick={clearFilters}
                      className="text-sm text-foreground hover:underline"
                    >
                      {showKorean ? "필터 초기화" : "Clear filters"}
                    </button>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
}

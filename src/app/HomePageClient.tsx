"use client";

import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  Map,
  Search,
  Star,
  Users,
  Target,
} from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import type { Resource } from "@/types";
import resourcesData from "@/data/resources.json";
import { useLanguage } from "@/components/LanguageProvider";

export default function HomePageClient() {
  const { showKorean } = useLanguage();
  const featuredResources: Resource[] = resourcesData.slice(0, 3) as Resource[];

  const stats = [
    {
      label: "Learning Resources",
      labelKorean: "학습 자료",
      value: "50+",
      icon: BookOpen,
    },
    {
      label: "Roadmap Steps",
      labelKorean: "로드맵 단계",
      value: "12",
      icon: Map,
    },
    {
      label: "Active Learners",
      labelKorean: "활성 학습자",
      value: "1,000+",
      icon: Users,
    },
    {
      label: "Success Rate",
      labelKorean: "성공률",
      value: "95%",
      icon: Star,
    },
  ];

  const features = [
    {
      icon: Map,
      title: "Structured Learning Path",
      titleKorean: "체계적인 학습 경로",
      description:
        "Follow our comprehensive roadmap from beginner to advanced Korean proficiency.",
      descriptionKorean:
        "초급부터 고급 한국어 실력까지 포괄적인 로드맵을 따라하세요.",
    },
    {
      icon: BookOpen,
      title: "Curated Resources",
      titleKorean: "선별된 자료",
      description:
        "Access handpicked apps, books, videos, and tools for effective Korean learning.",
      descriptionKorean:
        "효과적인 한국어 학습을 위한 선별된 앱, 책, 비디오, 도구에 접근하세요.",
    },
    {
      icon: Target,
      title: "Cultural Insights",
      titleKorean: "문화적 통찰",
      description:
        "Learn not just the language, but also Korean culture and context.",
      descriptionKorean: "언어뿐만 아니라 한국 문화와 맥락도 배우세요.",
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-background via-secondary/10 to-primary/5 py-20 lg:py-32 korean-pattern">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">
              {showKorean ? "한국어를 마스터하세요" : "Master Korean Language"}
              <span className="block text-primary korean-text text-3xl md:text-5xl mt-2">
                {showKorean
                  ? "Master Korean Language"
                  : "한국어를 마스터하세요"}
              </span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
              {showKorean
                ? "체계적인 로드맵, 선별된 자료, 문화적 통찰을 통해 한국어를 배우는 포괄적인 가이드입니다. 오늘부터 유창함으로의 여정을 시작하세요."
                : "Your comprehensive guide to learning Korean with structured roadmaps, curated resources, and cultural insights. Start your journey to fluency today."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/roadmap"
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus-ring"
              >
                {showKorean ? "학습 시작하기" : "Start Learning"}
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                href="/resources"
                className="inline-flex items-center gap-2 border-2 border-primary text-primary hover:bg-primary hover:text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus-ring"
              >
                {showKorean ? "자료 둘러보기" : "Browse Resources"}
                <BookOpen className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-4">
                  <stat.icon className="w-6 h-6 text-primary" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {showKorean && stat.labelKorean
                    ? stat.labelKorean
                    : stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              {showKorean
                ? "왜 Vynsera를 선택해야 할까요?"
                : "Why Choose Vynsera?"}
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              {showKorean
                ? "한국어를 효과적이고 효율적으로 배우는 데 필요한 모든 것을 제공합니다."
                : "We provide everything you need to learn Korean effectively and efficiently."}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="text-center p-6 rounded-xl bg-card border border-border hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-xl mx-auto mb-6">
                  <feature.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {showKorean && feature.titleKorean
                    ? feature.titleKorean
                    : feature.title}
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  {showKorean && feature.descriptionKorean
                    ? feature.descriptionKorean
                    : feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Resources Section */}
      <section className="py-20 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Featured Resources
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover our top-rated Korean learning resources to accelerate
              your progress.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredResources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus-ring"
            >
              View All Resources
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary to-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Start Your Korean Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of learners who have successfully mastered Korean
            with our structured approach.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/roadmap"
              className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus-ring"
            >
              <Map className="w-5 h-5" />
              View Roadmap
            </Link>
            <Link
              href="/resources"
              className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus-ring"
            >
              <Search className="w-5 h-5" />
              Explore Resources
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

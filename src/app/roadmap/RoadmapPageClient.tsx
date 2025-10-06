"use client";

import { Clock, Target, BookOpen, Users, CheckCircle } from "lucide-react";
import RoadmapAccordion from "@/components/RoadmapAccordion";
import type { Roadmap, Resource } from "@/types";
import roadmapData from "@/data/roadmap.json";
import resourcesData from "@/data/resources.json";

export default function RoadmapPageClient() {
  const roadmap: Roadmap = roadmapData as Roadmap;
  const resources: Resource[] = resourcesData as Resource[];

  const stats = [
    { label: "Total Steps", value: roadmap.steps.length, icon: Target },
    { label: "Estimated Time", value: roadmap.totalEstimatedTime, icon: Clock },
    { label: "Resources", value: resources.length, icon: BookOpen },
    { label: "Success Rate", value: "95%", icon: Users },
  ];

  const levels = [
    {
      name: "Beginner",
      count: roadmap.steps.filter((s) => s.level === "Beginner").length,
      color: "bg-green-500",
    },
    {
      name: "Intermediate",
      count: roadmap.steps.filter((s) => s.level === "Intermediate").length,
      color: "bg-yellow-500",
    },
    {
      name: "Advanced",
      count: roadmap.steps.filter((s) => s.level === "Advanced").length,
      color: "bg-red-500",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Korean Learning Roadmap
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Follow our comprehensive step-by-step guide to master Korean from
              beginner to advanced level. Each step includes estimated
              timeframes, skills to learn, and recommended resources.
            </p>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-lg mx-auto mb-3">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground mb-1">
                    {stat.value}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Level Overview */}
      <section className="py-12 bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Learning Levels Overview
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {levels.map((level) => (
              <div
                key={level.name}
                className="text-center p-6 rounded-xl bg-background border border-border"
              >
                <div
                  className={`w-16 h-16 ${level.color} rounded-full mx-auto mb-4 flex items-center justify-center`}
                >
                  <span className="text-white font-bold text-xl">
                    {level.count}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {level.name}
                </h3>
                <p className="text-muted-foreground text-sm">
                  {level.count} steps to complete this level
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Progress Tracker */}
      <section className="py-8 bg-background border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-2">
                Your Progress
              </h3>
              <p className="text-muted-foreground">
                Track your learning journey
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-right">
                <div className="text-2xl font-bold text-foreground">
                  0 / {roadmap.steps.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Steps Completed
                </div>
              </div>
              <div className="w-32 h-3 bg-muted rounded-full overflow-hidden">
                <div className="w-0 h-full bg-primary transition-all duration-300"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roadmap Steps */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground mb-4">
              Learning Steps
            </h2>
            <p className="text-muted-foreground">
              Click on each step to see detailed information, skills to learn,
              and recommended resources.
            </p>
          </div>

          <RoadmapAccordion steps={roadmap.steps} resources={resources} />
        </div>
      </section>

      {/* Getting Started CTA */}
      <section className="py-16 bg-gradient-to-r from-primary to-accent text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">
            Ready to Start Your Korean Learning Journey?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Begin with Step 1 and follow our structured path to Korean fluency.
            Each step builds upon the previous one for optimal learning.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="inline-flex items-center gap-2 bg-white text-primary hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus-ring">
              <CheckCircle className="w-5 h-5" />
              Start Step 1
            </button>
            <button className="inline-flex items-center gap-2 border-2 border-white text-white hover:bg-white hover:text-primary px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus-ring">
              <BookOpen className="w-5 h-5" />
              Browse Resources
            </button>
          </div>
        </div>
      </section>

      {/* Tips Section */}
      <section className="py-16 bg-card">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-foreground mb-8 text-center">
            Learning Tips
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="p-6 rounded-xl bg-background border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Consistency is Key
              </h3>
              <p className="text-muted-foreground">
                Study a little bit every day rather than cramming. Even 15-30
                minutes daily is more effective than long study sessions once a
                week.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-background border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Practice Speaking
              </h3>
              <p className="text-muted-foreground">
                Don&apos;t just read and write. Practice speaking Korean out
                loud, even if it&apos;s just to yourself. This helps with
                pronunciation and confidence.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-background border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Use Multiple Resources
              </h3>
              <p className="text-muted-foreground">
                Combine different types of resources - apps, books, videos, and
                podcasts. Each provides different learning benefits.
              </p>
            </div>
            <div className="p-6 rounded-xl bg-background border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-3">
                Immerse Yourself
              </h3>
              <p className="text-muted-foreground">
                Watch Korean dramas, listen to K-pop, or follow Korean social
                media. Immersion helps you learn naturally and understand
                cultural context.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

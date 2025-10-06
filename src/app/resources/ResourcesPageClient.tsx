"use client";

import { Filter, Search, Grid, List } from "lucide-react";
import ResourceCard from "@/components/ResourceCard";
import type { Resource } from "@/types";
import resourcesData from "@/data/resources.json";

export default function ResourcesPageClient() {
  const resources: Resource[] = resourcesData as Resource[];

  const categories = [
    "All",
    "App",
    "Book",
    "Video",
    "Website",
    "Podcast",
    "Course",
    "Tool",
  ];
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="bg-gradient-to-r from-primary/10 to-accent/10 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Korean Learning Resources
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Discover handpicked apps, books, videos, courses, and tools to
              accelerate your Korean learning journey. Each resource has been
              carefully selected and tested by our team.
            </p>
          </div>
        </div>
      </section>

      {/* Filters and Search */}
      <section className="py-8 bg-card border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
              <input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-10 pr-4 py-3 border border-border rounded-lg bg-background text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-4 items-center">
              {/* Category Filter */}
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-muted-foreground" />
                <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Level Filter */}
              <select className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary">
                {levels.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>

              {/* View Toggle */}
              <div className="flex items-center gap-1 p-1 bg-background rounded-lg border border-border">
                <button className="p-2 rounded-md hover:bg-primary/10 transition-colors">
                  <Grid className="w-4 h-4" />
                </button>
                <button className="p-2 rounded-md hover:bg-primary/10 transition-colors">
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Resources Grid */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Results Info */}
          <div className="flex items-center justify-between mb-8">
            <div className="text-muted-foreground">
              Showing {resources.length} resources
            </div>
            <div className="text-sm text-muted-foreground">
              Sort by:{" "}
              <span className="text-foreground font-medium">Most Popular</span>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {resources.map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>

          {/* Load More */}
          <div className="text-center mt-12">
            <button className="px-8 py-3 border border-primary text-primary hover:bg-primary hover:text-white rounded-lg font-medium transition-colors focus-ring">
              Load More Resources
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Can&apos;t Find What You&apos;re Looking For?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            We&apos;re constantly adding new resources. Let us know what
            you&apos;d like to see!
          </p>
          <button className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-lg font-semibold text-lg transition-colors focus-ring">
            Suggest a Resource
          </button>
        </div>
      </section>
    </div>
  );
}

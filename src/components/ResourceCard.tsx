"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Star,
  ExternalLink,
  Heart,
  BookOpen,
  Play,
  Globe,
  Mic,
  GraduationCap,
  Wrench,
} from "lucide-react";
import type { Resource } from "@/types";
import { useLanguage } from "./LanguageProvider";

interface ResourceCardProps {
  resource: Resource;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case "App":
      return <Heart className="w-5 h-5" />;
    case "Book":
      return <BookOpen className="w-5 h-5" />;
    case "Video":
      return <Play className="w-5 h-5" />;
    case "Website":
      return <Globe className="w-5 h-5" />;
    case "Podcast":
      return <Mic className="w-5 h-5" />;
    case "Course":
      return <GraduationCap className="w-5 h-5" />;
    case "Tool":
      return <Wrench className="w-5 h-5" />;
    default:
      return <BookOpen className="w-5 h-5" />;
  }
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "Beginner":
      return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
    case "Intermediate":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
    case "Advanced":
      return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
  }
};

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  const { showKorean } = useLanguage();
  return (
    <div className="group relative bg-card border border-border rounded-xl shadow-sm hover:shadow-lg hover:scale-[1.02] transition-all duration-300 overflow-hidden">
      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-secondary/20 to-primary/10 overflow-hidden">
        <Image
          src={resource.image}
          alt={resource.title}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex items-center gap-1 bg-card/90 backdrop-blur-sm px-2 py-1 rounded-full text-sm font-medium text-card-foreground">
          {getCategoryIcon(resource.category)}
          <span>{resource.category}</span>
        </div>

        {/* Free Badge */}
        {resource.isFree && (
          <div className="absolute top-3 right-3 bg-accent text-white px-2 py-1 rounded-full text-xs font-semibold">
            FREE
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-6">
        {/* Title */}
        <h3 className="text-xl font-semibold text-card-foreground mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {showKorean && resource.titleKorean
            ? resource.titleKorean
            : resource.title}
        </h3>

        {/* Description */}
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3">
          {showKorean && resource.descriptionKorean
            ? resource.descriptionKorean
            : resource.description}
        </p>

        {/* Level and Rating */}
        <div className="flex items-center justify-between mb-4">
          <span
            className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelColor(
              resource.level
            )}`}
          >
            {resource.level}
          </span>
          {resource.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 fill-accent text-accent" />
              <span className="text-sm font-medium text-card-foreground">
                {resource.rating}
              </span>
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mb-4">
          {resource.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 bg-secondary/20 text-secondary-foreground rounded-md text-xs font-medium"
            >
              {tag}
            </span>
          ))}
          {resource.tags.length > 3 && (
            <span className="px-2 py-1 bg-muted/20 text-muted-foreground rounded-md text-xs font-medium">
              +{resource.tags.length - 3}
            </span>
          )}
        </div>

        {/* Features */}
        <div className="mb-4">
          <p className="text-xs text-muted-foreground mb-2">Key Features:</p>
          <div className="flex flex-wrap gap-1">
            {resource.features.slice(0, 2).map((feature) => (
              <span
                key={feature}
                className="px-2 py-1 bg-primary/10 text-primary rounded-md text-xs"
              >
                {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Action Button */}
        <Link
          href={resource.link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 w-full justify-center bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors focus-ring"
        >
          <span>Visit Resource</span>
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Hover Effect Overlay */}
      <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default ResourceCard;

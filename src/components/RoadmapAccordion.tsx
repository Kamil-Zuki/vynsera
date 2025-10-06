"use client";

import { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Clock,
  CheckCircle,
  Users,
  BookOpen,
  Target,
} from "lucide-react";
import type { RoadmapStep, Resource } from "@/types";
import { useLanguage } from "./LanguageProvider";
import { useProgress } from "./ProgressProvider";

interface RoadmapAccordionProps {
  steps: RoadmapStep[];
  resources: Resource[];
  onStepToggle?: (stepId: string) => void;
}

const getLevelColor = (level: string) => {
  switch (level) {
    case "Beginner":
      return "border-l-green-500 bg-green-50 dark:bg-green-950";
    case "Intermediate":
      return "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950";
    case "Advanced":
      return "border-l-red-500 bg-red-50 dark:bg-red-950";
    default:
      return "border-l-gray-500 bg-gray-50 dark:bg-gray-950";
  }
};

const getLevelBadgeColor = (level: string) => {
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

const RoadmapAccordion: React.FC<RoadmapAccordionProps> = ({
  steps,
  resources,
  onStepToggle,
}) => {
  const { showKorean } = useLanguage();
  const { isStepCompleted, toggleStep: toggleProgress } = useProgress();
  const [expandedSteps, setExpandedSteps] = useState<Set<string>>(new Set());

  const toggleStep = (stepId: string) => {
    const newExpanded = new Set(expandedSteps);
    if (newExpanded.has(stepId)) {
      newExpanded.delete(stepId);
    } else {
      newExpanded.add(stepId);
    }
    setExpandedSteps(newExpanded);
    onStepToggle?.(stepId);
  };

  const handleProgressToggle = (stepId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent accordion from toggling
    toggleProgress(stepId);
  };

  const getResourceById = (resourceId: string) => {
    return resources.find((resource) => resource.id === resourceId);
  };

  return (
    <div className="space-y-4">
      {steps.map((step) => {
        const isExpanded = expandedSteps.has(step.id);
        const isCompleted = isStepCompleted(step.id);

        return (
          <div
            key={step.id}
            className={`border rounded-xl overflow-hidden transition-all duration-300 ${getLevelColor(
              step.level
            )}`}
          >
            {/* Step Header */}
            <button
              onClick={() => toggleStep(step.id)}
              className="w-full p-6 text-left hover:bg-white/50 dark:hover:bg-black/20 transition-colors focus-ring"
              aria-expanded={isExpanded}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  {/* Step Number and Status */}
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-card border-2 border-primary/20">
                      {isCompleted ? (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      ) : (
                        <span className="text-sm font-semibold text-primary">
                          {step.order}
                        </span>
                      )}
                    </div>

                    {/* Progress Checkbox */}
                    <button
                      onClick={(e) => handleProgressToggle(step.id, e)}
                      className="flex items-center justify-center w-6 h-6 rounded border-2 border-muted-foreground hover:border-primary transition-colors focus-ring"
                      aria-label={
                        isCompleted ? "Mark as incomplete" : "Mark as complete"
                      }
                    >
                      {isCompleted && (
                        <CheckCircle className="w-4 h-4 text-green-600" />
                      )}
                    </button>
                    {isExpanded ? (
                      <ChevronDown className="w-5 h-5 text-muted-foreground" />
                    ) : (
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    )}
                  </div>

                  {/* Step Content */}
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-card-foreground">
                        {showKorean && step.titleKorean
                          ? step.titleKorean
                          : step.title}
                      </h3>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${getLevelBadgeColor(
                          step.level
                        )}`}
                      >
                        {step.level}
                      </span>
                    </div>

                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {showKorean && step.descriptionKorean
                        ? step.descriptionKorean
                        : step.description}
                    </p>

                    {/* Step Meta Info */}
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{step.estimatedTime}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3" />
                        <span>{step.resources.length} resources</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        <span>{step.skills.length} skills</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="px-6 pb-6 border-t border-border/50">
                <div className="pt-6 space-y-6">
                  {/* Skills to Learn */}
                  <div>
                    <h4 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Skills You&apos;ll Learn
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {step.skills.map((skill) => (
                        <span
                          key={skill}
                          className="px-3 py-1 bg-primary/10 text-primary rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Recommended Resources */}
                  <div>
                    <h4 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Recommended Resources
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {step.resources.map((resourceId) => {
                        const resource = getResourceById(resourceId);
                        if (!resource) return null;

                        return (
                          <a
                            key={resourceId}
                            href={resource.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-primary/5 transition-colors group"
                          >
                            <div className="w-10 h-10 bg-secondary/20 rounded-lg flex items-center justify-center">
                              <BookOpen className="w-5 h-5 text-secondary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h5 className="text-sm font-medium text-card-foreground group-hover:text-primary transition-colors truncate">
                                {showKorean && resource.titleKorean
                                  ? resource.titleKorean
                                  : resource.title}
                              </h5>
                              <p className="text-xs text-muted-foreground truncate">
                                {resource.category} • {resource.level}
                              </p>
                            </div>
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  {/* Prerequisites */}
                  {step.prerequisites && step.prerequisites.length > 0 && (
                    <div>
                      <h4 className="text-sm font-semibold text-card-foreground mb-3 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Prerequisites
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {step.prerequisites.map((prereqId) => {
                          const prereqStep = steps.find(
                            (step) => step.id === prereqId
                          );
                          if (!prereqStep) return null;

                          return (
                            <span
                              key={prereqId}
                              className="px-3 py-1 bg-muted/20 text-muted-foreground rounded-full text-sm"
                            >
                              Step {prereqStep.order}:{" "}
                              {showKorean && prereqStep.titleKorean
                                ? prereqStep.titleKorean
                                : prereqStep.title}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RoadmapAccordion;

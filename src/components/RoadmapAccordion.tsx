"use client";

import { useState } from "react";
import { ChevronDown, Check } from "lucide-react";
import type { Roadmap } from "@/types";
import { useLanguage } from "./LanguageProvider";
import { useProgress } from "./ProgressProvider";

interface RoadmapAccordionProps {
  roadmap: Roadmap;
}

const RoadmapAccordion: React.FC<RoadmapAccordionProps> = ({ roadmap }) => {
  const { showKorean } = useLanguage();
  const { isStepCompleted, toggleStep } = useProgress();
  const [openSteps, setOpenSteps] = useState<Set<number>>(new Set([0]));

  const toggleStep_Accordion = (index: number) => {
    setOpenSteps((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  const handleProgressToggle = (e: React.MouseEvent, stepId: string) => {
    e.stopPropagation();
    toggleStep(stepId);
  };

  return (
    <div className="space-y-3">
      {roadmap.steps?.map((step, index) => {
        const isOpen = openSteps.has(index);
        const isCompleted = isStepCompleted(step.id);

        return (
          <div
            key={step.id}
            className="border border-border/40 rounded-lg overflow-hidden"
          >
            {/* Header */}
            <div className="w-full flex items-center justify-between p-6 transition-colors hover:bg-muted/30">
              <div className="flex items-center gap-4 flex-1">
                <div
                  onClick={(e) => handleProgressToggle(e, step.id)}
                  role="checkbox"
                  aria-checked={isCompleted}
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      handleProgressToggle(e as any, step.id);
                    }
                  }}
                  className={`flex-shrink-0 w-5 h-5 rounded border-2 transition-colors cursor-pointer ${
                    isCompleted
                      ? "bg-foreground border-foreground"
                      : "border-border/60"
                  }`}
                >
                  {isCompleted && (
                    <Check className="w-full h-full text-background p-0.5" />
                  )}
                </div>

                <button
                  onClick={() => toggleStep_Accordion(index)}
                  className="flex-1 text-left"
                >
                  <h3 className="font-semibold text-foreground mb-1">
                    {showKorean && step.titleKorean
                      ? step.titleKorean
                      : step.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">{step.level}</p>
                </button>
              </div>

              <button
                onClick={() => toggleStep_Accordion(index)}
                aria-label={isOpen ? "Collapse" : "Expand"}
              >
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    isOpen ? "transform rotate-180" : ""
                  }`}
                />
              </button>
            </div>

            {/* Content */}
            {isOpen && (
              <div className="px-6 pb-6 border-t border-border/40 pt-6">
                <p className="text-sm text-muted-foreground mb-6">
                  {showKorean && step.descriptionKorean
                    ? step.descriptionKorean
                    : step.description}
                </p>

                {/* Skills */}
                {step.skills && step.skills.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3">
                      {showKorean ? "기술" : "Skills"}
                    </h4>
                    <ul className="space-y-2">
                      {step.skills.map((skill, idx) => (
                        <li
                          key={idx}
                          className="text-sm text-muted-foreground flex items-start gap-2"
                        >
                          <span className="text-foreground mt-0.5">·</span>
                          <span>{skill}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default RoadmapAccordion;

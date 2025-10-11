"use client";

import { useState, useEffect } from "react";
import { Check, Lock, BookOpen, Play, ChevronRight } from "lucide-react";
import type { Roadmap, RoadmapStep, Resource } from "@/types";
import { useLanguage } from "./LanguageProvider";
import { useProgress } from "./ProgressProvider";

interface VisualRoadmapProps {
  roadmap: Roadmap;
}

export default function VisualRoadmap({ roadmap }: VisualRoadmapProps) {
  const { showKorean } = useLanguage();
  const { isStepCompleted, toggleStep } = useProgress();
  const [selectedStep, setSelectedStep] = useState<RoadmapStep | null>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [compact, setCompact] = useState(true);

  useEffect(() => {
    async function fetchResources() {
      if (
        !selectedStep ||
        !selectedStep.resources ||
        selectedStep.resources.length === 0
      ) {
        setResources([]);
        return;
      }

      try {
        setIsLoadingResources(true);
        const response = await fetch("/api/resources");
        if (response.ok) {
          const allResources = await response.json();
          const filtered = allResources.filter(
            (r: Resource) =>
              selectedStep.resources.includes(r.id) ||
              selectedStep.resources.includes(r.slug)
          );

          // Deduplicate by link (some resources share the same link/title but different ids)
          const seen = new Set<string>();
          const unique: Resource[] = [];
          for (const r of filtered) {
            const key = (r.link || r.title || r.id).toString().trim();
            if (!seen.has(key)) {
              seen.add(key);
              unique.push(r);
            }
          }

          // cap to reasonable number
          setResources(unique.slice(0, 12));
        }
      } catch (error) {
        console.error("Failed to load resources:", error);
      } finally {
        setIsLoadingResources(false);
      }
    }

    fetchResources();
  }, [selectedStep]);

  const isStepUnlocked = (step: RoadmapStep) => {
    if (!step.prerequisites || step.prerequisites.length === 0) return true;
    return step.prerequisites.every((preReqId) => {
      const preReqStep = roadmap.steps?.find((s) => s.id === preReqId);
      return preReqStep && isStepCompleted(preReqStep.id);
    });
  };

  const getStepStatus = (step: RoadmapStep) => {
    const completed = isStepCompleted(step.id);
    const unlocked = isStepUnlocked(step);

    if (completed) return "completed";
    if (unlocked) return "available";
    return "locked";
  };

  const handleStepClick = (step: RoadmapStep) => {
    const status = getStepStatus(step);
    if (status === "locked") return;
    setSelectedStep(selectedStep?.id === step.id ? null : step);
  };

  const handleToggleProgress = (stepId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    toggleStep(stepId);
  };

  return (
    <div className="space-y-6">
      {/* Compact toggle */}
      <div className="flex items-center justify-end mb-2">
        <button
          onClick={() => setCompact((c) => !c)}
          className="px-3 py-1 rounded-md border bg-muted/30 text-sm"
        >
          {compact ? (showKorean ? "4C8 Compact" : "Compact") : (showKorean ? "5A5 Expanded" : "Expanded")}
        </button>
      </div>

      <div className={compact ? "overflow-x-auto py-2" : "grid grid-cols-1 lg:grid-cols-2 gap-8"}>
        {/* Horizontal compact flow */}
        {compact ? (
          <div className="flex gap-4 w-full pb-4">
            {roadmap.steps?.map((step, index) => {
              const status = getStepStatus(step);
              const isSelected = selectedStep?.id === step.id;
              const isCompleted = status === "completed";
              const isLocked = status === "locked";

              return (
                <div
                  key={step.id}
                  className={`min-w-[18rem] flex-shrink-0 border-2 rounded-xl p-4 transition-all ${
                    isLocked ? "border-border/40 bg-muted/10 opacity-60" : isSelected ? "border-foreground shadow-lg" : isCompleted ? "border-foreground/40 bg-muted/30" : "border-border/60 hover:border-foreground/40"
                  }`}
                  onClick={() => handleStepClick(step)}
                  role="button"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {isLocked ? (
                        <div className="w-9 h-9 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                          <Lock className="w-4 h-4 text-muted-foreground" />
                        </div>
                      ) : isCompleted ? (
                        <div className="w-9 h-9 rounded-full bg-foreground flex items-center justify-center">
                          <Check className="w-5 h-5 text-background" />
                        </div>
                      ) : (
                        <div className="w-9 h-9 rounded-full border-2 border-foreground flex items-center justify-center text-foreground font-bold">
                          {step.order}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-sm mb-1 truncate">
                        {showKorean && step.titleKorean ? step.titleKorean : step.title}
                      </h4>
                      <p className="text-xs text-muted-foreground line-clamp-2">{showKorean && step.descriptionKorean ? step.descriptionKorean : step.description}</p>
                      <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium">{step.level}</span>
                        <span>{step.estimatedTime}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          // Expanded (original vertical layout)
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {roadmap.steps?.map((step, index) => {
                const status = getStepStatus(step);
                const isSelected = selectedStep?.id === step.id;
                const isCompleted = status === "completed";
                const isLocked = status === "locked";

                return (
                  <div key={step.id} className="relative">
                    {/* Keep original vertical rendering for expanded mode */}
                    {index < (roadmap.steps?.length || 0) - 1 && (
                      <div className={`absolute left-8 top-full w-0.5 h-4 ${isCompleted ? "bg-foreground" : "bg-border"}`} />
                    )}

                    <button
                      onClick={() => handleStepClick(step)}
                      disabled={isLocked}
                      className={`w-full text-left border-2 rounded-xl p-6 transition-all ${isLocked ? "border-border/40 bg-muted/20 opacity-50 cursor-not-allowed" : isSelected ? "border-foreground shadow-lg" : isCompleted ? "border-foreground/40 bg-muted/30" : "border-border/60 hover:border-foreground/40 hover:shadow-md"}`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {isLocked ? (
                            <div className="w-10 h-10 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                              <Lock className="w-5 h-5 text-muted-foreground" />
                            </div>
                          ) : isCompleted ? (
                            <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
                              <Check className="w-6 h-6 text-background" />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center text-foreground font-bold">{step.order}</div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <h3 className="font-bold text-lg text-foreground mb-1">{showKorean && step.titleKorean ? step.titleKorean : step.title}</h3>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium">{step.level}</span>
                                <span>{step.estimatedTime}</span>
                              </div>
                            </div>

                            {!isLocked && (
                              <div onClick={(e) => handleToggleProgress(step.id, e)} role="checkbox" aria-checked={isCompleted} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${isCompleted ? "bg-foreground text-background" : "bg-muted text-muted-foreground hover:bg-muted/80"}`}>
                                {isCompleted ? (showKorean ? "44D Done" : "Done") : (showKorean ? "Start" : "Start")}
                              </div>
                            )}
                          </div>

                          <p className="text-sm text-muted-foreground line-clamp-2">{showKorean && step.descriptionKorean ? step.descriptionKorean : step.description}</p>

                          {!isLocked && step.skills && step.skills.length > 0 && (
                            <div className="mt-3 flex flex-wrap gap-2">{step.skills.slice(0, 4).map((skill, idx) => (<span key={idx} className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded">{skill}</span>))}{step.skills.length > 4 && (<span className="text-xs text-muted-foreground">+{step.skills.length - 4} more</span>)}</div>
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {/* Roadmap Flowchart */}
      <div className="lg:col-span-2">
        <div className="space-y-4">
          {roadmap.steps?.map((step, index) => {
            const status = getStepStatus(step);
            const isSelected = selectedStep?.id === step.id;
            const isCompleted = status === "completed";
            const isLocked = status === "locked";

            return (
              <div key={step.id} className="relative">
                {/* Connecting Line */}
                {index < (roadmap.steps?.length || 0) - 1 && (
                  <div
                    className={`absolute left-8 top-full w-0.5 h-4 ${
                      isCompleted ? "bg-foreground" : "bg-border"
                    }`}
                  />
                )}

                {/* Step Node */}
                <button
                  onClick={() => handleStepClick(step)}
                  disabled={isLocked}
                  className={`w-full text-left border-2 rounded-xl p-6 transition-all ${
                    isLocked
                      ? "border-border/40 bg-muted/20 opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "border-foreground shadow-lg"
                      : isCompleted
                      ? "border-foreground/40 bg-muted/30"
                      : "border-border/60 hover:border-foreground/40 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Status Icon */}
                    <div className="flex-shrink-0 mt-1">
                      {isLocked ? (
                        <div className="w-10 h-10 rounded-full bg-muted border-2 border-border flex items-center justify-center">
                          <Lock className="w-5 h-5 text-muted-foreground" />
                        </div>
                      ) : isCompleted ? (
                        <div className="w-10 h-10 rounded-full bg-foreground flex items-center justify-center">
                          <Check className="w-6 h-6 text-background" />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full border-2 border-foreground flex items-center justify-center text-foreground font-bold">
                          {step.order}
                        </div>
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="font-bold text-lg text-foreground mb-1">
                            {showKorean && step.titleKorean
                              ? step.titleKorean
                              : step.title}
                          </h3>
                          <div className="flex items-center gap-3 text-sm text-muted-foreground">
                            <span className="px-2 py-0.5 bg-muted rounded text-xs font-medium">
                              {step.level}
                            </span>
                            <span>{step.estimatedTime}</span>
                          </div>
                        </div>

                        {!isLocked && (
                          <div
                            onClick={(e) => handleToggleProgress(step.id, e)}
                            role="checkbox"
                            aria-checked={isCompleted}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                              isCompleted
                                ? "bg-foreground text-background"
                                : "bg-muted text-muted-foreground hover:bg-muted/80"
                            }`}
                          >
                            {isCompleted
                              ? showKorean
                                ? "완료"
                                : "Done"
                              : showKorean
                              ? "시작"
                              : "Start"}
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {showKorean && step.descriptionKorean
                          ? step.descriptionKorean
                          : step.description}
                      </p>

                      {!isLocked && step.skills && step.skills.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {step.skills.slice(0, 4).map((skill, idx) => (
                            <span
                              key={idx}
                              className="text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded"
                            >
                              {skill}
                            </span>
                          ))}
                          {step.skills.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{step.skills.length - 4} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Expand Indicator */}
                    {!isLocked && (
                      <ChevronRight
                        className={`w-5 h-5 text-muted-foreground flex-shrink-0 mt-2 transition-transform ${
                          isSelected ? "rotate-90" : ""
                        }`}
                      />
                    )}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Details Panel */}
      <div>
        <div className="border border-border/40 rounded-xl p-6 bg-card">
          {selectedStep ? (
            <div>
              <h2 className="text-xl font-bold text-foreground mb-4">
                {showKorean && selectedStep.titleKorean ? selectedStep.titleKorean : selectedStep.title}
              </h2>

              <div className="space-y-4">
                {/* Description */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-2">{showKorean ? "설명" : "Description"}</h3>
                  <p className="text-sm text-muted-foreground">{showKorean && selectedStep.descriptionKorean ? selectedStep.descriptionKorean : selectedStep.description}</p>
                </div>

                {/* Resources */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">{showKorean ? "추천 자료" : "Recommended Resources"}</h3>
                  {isLoadingResources ? (
                    <p className="text-sm text-muted-foreground">{showKorean ? "로딩 중..." : "Loading..."}</p>
                  ) : resources.length > 0 ? (
                    <div className="space-y-3">
                      {resources.map((resource) => (
                        <a key={resource.id} href={resource.link} target="_blank" rel="noopener noreferrer" className="block p-3 border border-border/40 rounded-lg hover:border-foreground/40 transition-colors group">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground group-hover:underline mb-1">{showKorean && resource.titleKorean ? resource.titleKorean : resource.title}</p>
                              <p className="text-xs text-muted-foreground">{resource.category} • {resource.level}</p>
                            </div>
                            <Play className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                          </div>
                        </a>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">{showKorean ? "이 단계에 대한 자료를 추가 중입니다." : "Resources coming soon for this step."}</p>
                  )}
                </div>

                {/* Time Estimate */}
                <div className="pt-4 border-t border-border/40">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{showKorean ? "예상 시간" : "Estimated Time"}</span>
                    <span className="font-medium text-foreground">{selectedStep.estimatedTime}</span>
                  </div>
                </div>

                {/* Action Button */}
                <div className="pt-4">
                  <button onClick={(e) => handleToggleProgress(selectedStep.id, e)} className={`w-full py-3 px-4 rounded-lg font-medium transition-colors ${isStepCompleted(selectedStep.id) ? "bg-muted text-foreground hover:bg-muted/80" : "bg-foreground text-background hover:opacity-90"}`}>
                    {isStepCompleted(selectedStep.id) ? (showKorean ? "완료됨으로 표시" : "Mark as Incomplete") : (showKorean ? "완료로 표시" : "Mark as Complete")}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold text-foreground mb-2">{showKorean ? "단계 선택" : "Select a Step"}</h3>
              <p className="text-sm text-muted-foreground">{showKorean ? "왼쪽에서 단계를 클릭하여 자세한 내용과 자료를 확인하세요." : "Click on a step to view details and resources."}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

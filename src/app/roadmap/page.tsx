import { Metadata } from "next";
import RoadmapPageClient from "./RoadmapPageClient";

export const metadata: Metadata = {
  title: "Korean Learning Roadmap",
  description:
    "Follow our comprehensive step-by-step roadmap to learn Korean from beginner to advanced level. Structured learning path with estimated timeframes and recommended resources.",
  keywords: [
    "Korean roadmap",
    "Korean learning path",
    "Korean curriculum",
    "Korean study plan",
    "Korean learning steps",
  ],
};

export default function RoadmapPage() {
  return <RoadmapPageClient />;
}

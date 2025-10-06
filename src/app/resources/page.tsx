import { Metadata } from "next";
import ResourcesPageClient from "./ResourcesPageClient";

export const metadata: Metadata = {
  title: "Korean Learning Resources",
  description:
    "Discover curated Korean learning resources including apps, books, videos, courses, and tools to accelerate your language learning journey.",
  keywords: [
    "Korean resources",
    "Korean apps",
    "Korean books",
    "Korean courses",
    "Korean learning tools",
  ],
};

export default function ResourcesPage() {
  return <ResourcesPageClient />;
}

import { Metadata } from "next";
import SearchPageClient from "./SearchPageClient";

export const metadata: Metadata = {
  title: "Search Korean Learning Resources",
  description:
    "Search and filter 79+ Korean learning resources by level, category, language, and more. Find the perfect resources for your Korean learning journey.",
  keywords: [
    "Korean search",
    "Korean resources search",
    "Korean learning filter",
    "Korean study materials",
    "Korean language search",
  ],
};

export default function SearchPage() {
  return <SearchPageClient />;
}

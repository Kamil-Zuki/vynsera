import { Metadata } from "next";
import DashboardPageClient from "./DashboardPageClient";

export const metadata: Metadata = {
  title: "My Dashboard - Korean Learning Progress",
  description:
    "Track your Korean learning progress, view achievements, and monitor your study streaks.",
  keywords: [
    "dashboard",
    "progress",
    "Korean learning",
    "analytics",
    "achievements",
  ],
};

export default function DashboardPage() {
  return <DashboardPageClient />;
}


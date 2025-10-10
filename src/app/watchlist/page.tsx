import { Metadata } from "next";
import WatchlistPageClient from "./WatchlistPageClient";

export const metadata: Metadata = {
  title: "My Watchlist - Saved Korean Resources",
  description:
    "View and manage your saved Korean learning resources. Keep track of the tools and content you want to explore.",
  keywords: [
    "Korean watchlist",
    "saved resources",
    "Korean favorites",
    "bookmarked resources",
    "Korean study list",
  ],
};

export default function WatchlistPage() {
  return <WatchlistPageClient />;
}

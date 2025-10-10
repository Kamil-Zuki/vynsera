"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

interface WatchlistContextType {
  watchlist: string[];
  addToWatchlist: (resourceId: string) => void;
  removeFromWatchlist: (resourceId: string) => void;
  isInWatchlist: (resourceId: string) => boolean;
  watchlistCount: number;
}

const WatchlistContext = createContext<WatchlistContextType | undefined>(
  undefined
);

export function WatchlistProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load watchlist from localStorage or database
  useEffect(() => {
    async function loadWatchlist() {
      if (status === "loading") return;

      if (status === "authenticated") {
        // Load from database
        try {
          const response = await fetch("/api/user/watchlist");
          if (response.ok) {
            const data = await response.json();
            setWatchlist(data.watchlist || []);
            setIsLoaded(true);
          } else {
            // Fallback to localStorage
            loadFromLocalStorage();
          }
        } catch (error) {
          console.error("Failed to load watchlist from database:", error);
          loadFromLocalStorage();
        }
      } else {
        // Load from localStorage
        loadFromLocalStorage();
      }
    }

    function loadFromLocalStorage() {
      const stored = localStorage.getItem("korean-watchlist");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          setWatchlist(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error("Failed to parse watchlist:", e);
          setWatchlist([]);
        }
      }
      setIsLoaded(true);
    }

    loadWatchlist();
  }, [status]);

  // Save watchlist to localStorage and/or database
  useEffect(() => {
    if (!isLoaded) return;

    // Always save to localStorage as backup
    localStorage.setItem("korean-watchlist", JSON.stringify(watchlist));

    // If authenticated, sync to database
    if (status === "authenticated") {
      const syncToDatabase = async () => {
        try {
          await fetch("/api/user/watchlist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ watchlist }),
          });
        } catch (error) {
          console.error("Failed to sync watchlist to database:", error);
        }
      };
      syncToDatabase();
    }
  }, [watchlist, isLoaded, status]);

  const addToWatchlist = (resourceId: string) => {
    setWatchlist((prev) => {
      if (prev.includes(resourceId)) return prev;
      return [...prev, resourceId];
    });
  };

  const removeFromWatchlist = (resourceId: string) => {
    setWatchlist((prev) => prev.filter((id) => id !== resourceId));
  };

  const isInWatchlist = (resourceId: string) => {
    return watchlist.includes(resourceId);
  };

  return (
    <WatchlistContext.Provider
      value={{
        watchlist,
        addToWatchlist,
        removeFromWatchlist,
        isInWatchlist,
        watchlistCount: watchlist.length,
      }}
    >
      {children}
    </WatchlistContext.Provider>
  );
}

export function useWatchlist() {
  const context = useContext(WatchlistContext);
  if (context === undefined) {
    throw new Error("useWatchlist must be used within a WatchlistProvider");
  }
  return context;
}

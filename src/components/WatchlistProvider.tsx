"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

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
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load watchlist from localStorage on mount
  useEffect(() => {
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
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("korean-watchlist", JSON.stringify(watchlist));
    }
  }, [watchlist, isLoaded]);

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

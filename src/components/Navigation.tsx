"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  Moon,
  Sun,
  Bookmark,
  User,
  Users,
  LogOut,
  LogIn,
} from "lucide-react";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "./LanguageProvider";
import { useWatchlist } from "./WatchlistProvider";
import { useSession, signOut } from "next-auth/react";

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const { language, setLanguage, showKorean } = useLanguage();
  const { watchlistCount } = useWatchlist();
  const { data: session, status } = useSession();
  const [pendingRequests, setPendingRequests] = useState(0);

  const allNavigationItems = [
    { label: "Home", labelKorean: "홈", href: "/", requiresAuth: false },
    {
      label: "Dashboard",
      labelKorean: "대시보드",
      href: "/dashboard",
      requiresAuth: true,
    },
    {
      label: "Roadmap",
      labelKorean: "로드맵",
      href: "/roadmap",
      requiresAuth: true,
    },
    {
      label: "Search",
      labelKorean: "검색",
      href: "/search",
      requiresAuth: false,
    },
      {
        label: "Friends",
        labelKorean: "친구",
        href: "/friends",
        requiresAuth: true,
      },
    {
      label: "Watchlist",
      labelKorean: "관심 목록",
      href: "/watchlist",
      requiresAuth: true,
    },
  ];

  // Filter navigation items based on authentication
  const navigationItems = allNavigationItems.filter(
    (item) => !item.requiresAuth || status === "authenticated"
  );

  useEffect(() => {
    let mounted = true;
    async function fetchPending() {
      if (status !== 'authenticated') {
        setPendingRequests(0);
        return;
      }
      try {
        const res = await fetch('/api/friends');
        if (!res.ok) return;
        const data = await res.json();
        if (!mounted) return;
        setPendingRequests((data.requests || []).length || 0);
      } catch (e) {
        // ignore
      }
    }
    fetchPending();
    return () => { mounted = false; };
  }, [status]);

  return (
    <nav className="border-b border-border/40">
      <div className="max-w-6xl mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link
            href="/"
            className="text-xl font-semibold text-foreground hover:opacity-80 transition-opacity"
          >
            Vynsera
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`text-sm transition-colors relative ${
                  pathname === item.href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {showKorean && item.labelKorean ? item.labelKorean : item.label}
                {item.href === "/watchlist" && watchlistCount > 0 && (
                  <span className="absolute -top-2 -right-4 bg-primary text-primary-foreground text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {watchlistCount}
                  </span>
                )}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setLanguage(language === "en" ? "ko" : "en")}
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              {language === "en" ? "한국어" : "EN"}
            </button>

            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 text-muted-foreground hover:text-foreground transition-colors"
            >
              {theme === "dark" ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>

            {/* User Menu */}
            {status === "authenticated" ? (
              <div className="hidden md:block relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                >
                  {session.user?.image ? (
                    <img
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 border border-border/40 rounded-lg bg-card shadow-lg py-2 z-50">
                    <div className="px-4 py-2 border-b border-border/40">
                      <p className="text-sm font-medium text-foreground">
                        {session.user?.name}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {session.user?.email}
                      </p>
                    </div>
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="w-full text-left px-4 py-2 text-sm text-foreground hover:bg-muted transition-colors flex items-center gap-2"
                    >
                      <LogOut className="w-4 h-4" />
                      {showKorean ? "로그아웃" : "Sign Out"}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="hidden md:flex items-center gap-2 px-4 py-2 border border-border/40 rounded-lg text-sm text-foreground hover:border-foreground/40 transition-colors"
              >
                <LogIn className="w-4 h-4" />
                {showKorean ? "로그인" : "Sign In"}
              </Link>
            )}

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-foreground"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-border/40 mt-4 pt-4">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between py-2 text-sm transition-colors ${
                  pathname === item.href
                    ? "text-foreground font-medium"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span>
                  {showKorean && item.labelKorean
                    ? item.labelKorean
                    : item.label}
                </span>
                {item.href === "/watchlist" && watchlistCount > 0 && (
                  <span className="bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                    {watchlistCount}
                  </span>
                )}
              </Link>
            ))}

            <div className="border-t border-border/40 mt-4 pt-4">
              {status === "authenticated" ? (
                <div>
                  <div className="px-2 py-2 mb-2">
                    <p className="text-sm font-medium text-foreground">
                      {session.user?.name}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {session.user?.email}
                    </p>
                  </div>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left px-2 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" />
                    {showKorean ? "로그아웃" : "Sign Out"}
                  </button>
                </div>
              ) : (
                <Link
                  href="/auth/signin"
                  className="flex items-center gap-2 px-2 py-2 text-sm text-foreground hover:bg-muted transition-colors rounded"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <LogIn className="w-4 h-4" />
                  {showKorean ? "로그인" : "Sign In"}
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

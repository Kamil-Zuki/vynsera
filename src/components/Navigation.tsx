"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Menu,
  X,
  BookOpen,
  Map,
  Home,
  Search,
  Globe,
  Moon,
  Sun,
  Monitor,
} from "lucide-react";
import type { NavigationItem } from "@/types";
import { useTheme } from "./ThemeProvider";
import { useLanguage } from "./LanguageProvider";

const Navigation: React.FC = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme, actualTheme } = useTheme();
  const { language, setLanguage, showKorean } = useLanguage();
  const themeMenuRef = useRef<HTMLDivElement>(null);

  // Close theme menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(event.target as Node)
      ) {
        setIsThemeMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const navigationItems: NavigationItem[] = [
    {
      label: "Home",
      labelKorean: "홈",
      href: "/",
      icon: "home",
    },
    {
      label: "Roadmap",
      labelKorean: "로드맵",
      href: "/roadmap",
      icon: "map",
    },
    {
      label: "Resources",
      labelKorean: "자료",
      href: "/resources",
      icon: "book",
    },
    {
      label: "Search",
      labelKorean: "검색",
      href: "/search",
      icon: "search",
    },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case "home":
        return <Home className="w-5 h-5" />;
      case "map":
        return <Map className="w-5 h-5" />;
      case "book":
        return <BookOpen className="w-5 h-5" />;
      case "search":
        return <Search className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-card/95 border-b border-border sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-card-foreground group-hover:text-primary transition-colors">
                Vynsera
              </span>
              {showKorean && (
                <span className="text-xs text-muted-foreground korean-text">
                  한국어 학습
                </span>
              )}
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigationItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors focus-ring ${
                  isActive(item.href)
                    ? "bg-primary text-white"
                    : "text-muted-foreground hover:text-card-foreground hover:bg-primary/10"
                }`}
              >
                {getIcon(item.icon || "")}
                <span>
                  {showKorean && item.labelKorean
                    ? item.labelKorean
                    : item.label || ""}
                </span>
              </Link>
            ))}
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center gap-4">
            {/* Theme Toggle */}
            <div className="relative" ref={themeMenuRef}>
              <button
                onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                className="p-2 rounded-lg text-muted-foreground hover:text-card-foreground hover:bg-primary/10 transition-colors focus-ring"
                aria-label="Toggle theme"
              >
                {actualTheme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : (
                  <Moon className="w-5 h-5" />
                )}
              </button>

              {/* Theme Menu */}
              {isThemeMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-50">
                  <div className="p-2">
                    <button
                      onClick={() => {
                        setTheme("light");
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        theme === "light"
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:text-card-foreground hover:bg-primary/10"
                      }`}
                    >
                      <Sun className="w-4 h-4" />
                      {showKorean ? "라이트 모드" : "Light"}
                    </button>
                    <button
                      onClick={() => {
                        setTheme("dark");
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        theme === "dark"
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:text-card-foreground hover:bg-primary/10"
                      }`}
                    >
                      <Moon className="w-4 h-4" />
                      {showKorean ? "다크 모드" : "Dark"}
                    </button>
                    <button
                      onClick={() => {
                        setTheme("system");
                        setIsThemeMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors ${
                        theme === "system"
                          ? "bg-primary text-white"
                          : "text-muted-foreground hover:text-card-foreground hover:bg-primary/10"
                      }`}
                    >
                      <Monitor className="w-4 h-4" />
                      {showKorean ? "시스템" : "System"}
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === "en" ? "ko" : "en")}
              className="px-3 py-1 rounded-lg text-sm font-medium text-muted-foreground hover:text-card-foreground hover:bg-primary/10 transition-colors focus-ring"
              aria-label="Toggle language"
            >
              {showKorean ? "EN" : "한"}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-card-foreground hover:bg-primary/10 transition-colors focus-ring"
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg text-base font-medium transition-colors focus-ring ${
                    isActive(item.href)
                      ? "bg-primary text-white"
                      : "text-muted-foreground hover:text-card-foreground hover:bg-primary/10"
                  }`}
                >
                  {getIcon(item.icon || "")}
                  <span>
                    {showKorean && item.labelKorean
                      ? item.labelKorean
                      : item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;

"use client";

import Link from "next/link";
import { useLanguage } from "./LanguageProvider";

const Footer: React.FC = () => {
  const { showKorean } = useLanguage();
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border/40 mt-auto">
      <div className="max-w-6xl mx-auto px-6 sm:px-8 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-center md:text-left">
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Vynsera
            </h3>
            <p className="text-sm text-muted-foreground max-w-md">
              {showKorean
                ? "한국어 학습을 위한 포괄적인 가이드"
                : "Your comprehensive guide to learning Korean"}
            </p>
          </div>

          <div className="flex gap-8 text-sm">
            <Link
              href="/roadmap"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {showKorean ? "로드맵" : "Roadmap"}
            </Link>
            <Link
              href="/search"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {showKorean ? "검색" : "Search"}
            </Link>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-border/40 text-center">
          <p className="text-sm text-muted-foreground">
            © {currentYear} Vynsera.{" "}
            {showKorean ? "모든 권리 보유" : "All rights reserved"}.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

"use client";

import Link from "next/link";
import { Heart, Github, Twitter, Mail, Globe, BookOpen } from "lucide-react";
import { useLanguage } from "./LanguageProvider";

const Footer: React.FC = () => {
  const { showKorean } = useLanguage();
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    learn: [
      { label: "Roadmap", labelKorean: "로드맵", href: "/roadmap" },
      { label: "Resources", labelKorean: "자료", href: "/resources" },
      { label: "Search", labelKorean: "검색", href: "/search" },
      { label: "Cultural Tips", labelKorean: "문화 팁", href: "/culture" },
    ],
    support: [
      { label: "About", labelKorean: "소개", href: "/about" },
      { label: "Contact", labelKorean: "연락처", href: "/contact" },
      { label: "FAQ", labelKorean: "자주 묻는 질문", href: "/faq" },
      { label: "Privacy", labelKorean: "개인정보처리방침", href: "/privacy" },
    ],
    community: [
      {
        label: "GitHub",
        labelKorean: "깃허브",
        href: "https://github.com/vynsera",
        external: true,
      },
      {
        label: "Discord",
        labelKorean: "디스코드",
        href: "https://discord.gg/vynsera",
        external: true,
      },
      {
        label: "Twitter",
        labelKorean: "트위터",
        href: "https://twitter.com/vynsera",
        external: true,
      },
      { label: "Newsletter", labelKorean: "뉴스레터", href: "/newsletter" },
    ],
  };

  const socialLinks = [
    { icon: Github, href: "https://github.com/vynsera", label: "GitHub" },
    { icon: Twitter, href: "https://twitter.com/vynsera", label: "Twitter" },
    { icon: Mail, href: "mailto:hello@vynsera.com", label: "Email" },
  ];

  return (
    <footer className="bg-card border-t border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
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
            <p className="text-muted-foreground text-sm mb-6 leading-relaxed">
              {showKorean
                ? "한국어 학습을 위한 포괄적인 리소스와 로드맵을 제공하는 플랫폼입니다."
                : "A comprehensive platform providing resources and roadmaps for Korean language learning."}
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target={social.href.startsWith("http") ? "_blank" : undefined}
                  rel={
                    social.href.startsWith("http")
                      ? "noopener noreferrer"
                      : undefined
                  }
                  className="p-2 rounded-lg text-muted-foreground hover:text-primary hover:bg-primary/10 transition-colors focus-ring"
                  aria-label={social.label}
                >
                  <social.icon className="w-5 h-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Learn Section */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <BookOpen className="w-4 h-4" />
              {showKorean ? "학습" : "Learn"}
            </h3>
            <ul className="space-y-3">
              {footerLinks.learn.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors focus-ring"
                  >
                    {showKorean && link.labelKorean
                      ? link.labelKorean
                      : link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support Section */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Heart className="w-4 h-4" />
              {showKorean ? "지원" : "Support"}
            </h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors focus-ring"
                  >
                    {showKorean && link.labelKorean
                      ? link.labelKorean
                      : link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Community Section */}
          <div>
            <h3 className="text-sm font-semibold text-card-foreground mb-4 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              {showKorean ? "커뮤니티" : "Community"}
            </h3>
            <ul className="space-y-3">
              {footerLinks.community.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    rel={link.external ? "noopener noreferrer" : undefined}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors focus-ring"
                  >
                    {showKorean && link.labelKorean
                      ? link.labelKorean
                      : link.label}
                    {link.external && <span className="ml-1 text-xs">↗</span>}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-muted-foreground">
              © {currentYear} Vynsera.{" "}
              {showKorean ? "모든 권리 보유." : "All rights reserved."}
            </div>
            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              <Link
                href="/terms"
                className="hover:text-primary transition-colors focus-ring"
              >
                {showKorean ? "이용약관" : "Terms"}
              </Link>
              <Link
                href="/privacy"
                className="hover:text-primary transition-colors focus-ring"
              >
                {showKorean ? "개인정보처리방침" : "Privacy"}
              </Link>
              <Link
                href="/license"
                className="hover:text-primary transition-colors focus-ring"
              >
                {showKorean ? "라이선스" : "License"}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

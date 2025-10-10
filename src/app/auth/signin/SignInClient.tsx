"use client";

import { signIn } from "next-auth/react";
import { useLanguage } from "@/components/LanguageProvider";
import { Chrome } from "lucide-react";

export default function SignInClient() {
  const { showKorean } = useLanguage();

  const handleGoogleSignIn = async () => {
    await signIn("google", { callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">
            {showKorean ? "로그인" : "Sign In"}
          </h1>
          <p className="text-muted-foreground">
            {showKorean
              ? "모든 기기에서 진행 상황과 관심 목록을 동기화하세요"
              : "Sync your progress and watchlist across all devices"}
          </p>
        </div>

        <div className="border border-border/40 rounded-xl p-8 bg-card">
          <button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-3 border-2 border-border/60 hover:border-foreground/40 rounded-lg px-6 py-4 transition-all group"
          >
            <Chrome className="w-5 h-5 text-foreground" />
            <span className="font-medium text-foreground">
              {showKorean ? "Google로 계속하기" : "Continue with Google"}
            </span>
          </button>

          <div className="mt-6 text-sm text-muted-foreground text-center">
            <p>
              {showKorean
                ? "로그인하면 무료이며 계정이 자동으로 생성됩니다"
                : "Free to sign in. Your account will be created automatically."}
            </p>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-muted-foreground">
            {showKorean
              ? "계정 없이 계속하시겠습니까?"
              : "Don't want to sign in?"}
          </p>
          <a
            href="/"
            className="text-sm text-foreground hover:underline mt-2 inline-block"
          >
            {showKorean ? "계정 없이 계속하기 →" : "Continue without account →"}
          </a>
        </div>
      </div>
    </div>
  );
}

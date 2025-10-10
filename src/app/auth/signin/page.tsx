import { Metadata } from "next";
import SignInClient from "./SignInClient";

export const metadata: Metadata = {
  title: "Sign In - Vynsera",
  description: "Sign in to sync your progress and watchlist across devices.",
};

export default function SignInPage() {
  return <SignInClient />;
}

import type { Metadata } from "next";
import { Inter, Noto_Sans_KR, Poppins } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/components/LanguageProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  display: "swap",
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Vynsera - Learn Korean Language",
    template: "%s | Vynsera",
  },
  description:
    "A comprehensive platform for learning Korean language with structured roadmaps, curated resources, and cultural insights. Start your Korean learning journey today.",
  keywords: [
    "Korean language",
    "learn Korean",
    "Korean learning",
    "Korean resources",
    "Korean roadmap",
    "한국어",
    "한국어 학습",
  ],
  authors: [{ name: "Vynsera Team" }],
  creator: "Vynsera",
  publisher: "Vynsera",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://vynsera.com"),
  alternates: {
    canonical: "/",
    languages: {
      "en-US": "/en",
      "ko-KR": "/ko",
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://vynsera.com",
    title: "Vynsera - Learn Korean Language",
    description:
      "A comprehensive platform for learning Korean language with structured roadmaps, curated resources, and cultural insights.",
    siteName: "Vynsera",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Vynsera - Korean Language Learning Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vynsera - Learn Korean Language",
    description:
      "A comprehensive platform for learning Korean language with structured roadmaps, curated resources, and cultural insights.",
    images: ["/og-image.jpg"],
    creator: "@vynsera",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${notoSansKR.variable} ${poppins.variable}`}
    >
      <body className="min-h-screen bg-background text-foreground antialiased">
        <ThemeProvider>
          <LanguageProvider>
            <div className="flex flex-col min-h-screen">
              <Navigation />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

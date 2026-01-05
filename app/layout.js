import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import Providers from "@/components/Providers";

export const metadata = {
  title: "PlagDetect - Advanced AI Plagiarism Checker",
  description: "Detect plagiarism accurately with our semantic analysis engine. Features 3D visualization, deep web search, and instant reports for students and professionals.",
  keywords: ["plagiarism checker", "AI detection", "originality check", "student tools", "academic integrity"],
  authors: [{ name: "PlagDetect Team" }],
  openGraph: {
    title: "PlagDetect - AI Plagiarism Checker",
    description: "Ensure your content is 100% original with PlagDetect.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "PlagDetect",
    description: "Advanced AI-powered plagiarism detection.",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Providers>
            {children}
            <Toaster position="top-right" richColors />
          </Providers>
        </ThemeProvider>
      </body>
    </html>
  );
}

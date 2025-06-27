import type { Metadata } from "next";
import { Spectral } from "next/font/google";
import "./globals.css";
import { PageLoadingBar } from "@/components/ui/page-loading-bar";
import { Toaster } from "@/components/ui/toaster";

const fontSans = Spectral({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: "400"
});

const fontMono = Spectral({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: "400"
});

export const metadata: Metadata = {
  title: "DeckSmith - Wizard101 Deck Builder",
  description:
    "Create, share, and discover amazing Wizard101 deck builds with our intuitive deck builder. Join the community and perfect your strategy."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} ${fontMono.variable} antialiased`}>
        <PageLoadingBar />
        {children}
        <Toaster />
      </body>
    </html>
  );
}

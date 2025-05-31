"use client";

import { Button } from "@/components/ui/button";
import SwirlBackground from "@/components/ui/swirl-background";
import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Animated Canvas Background */}
      <SwirlBackground />

      {/* Header Navigation */}
      <header className="border-b sticky top-0 border-white/10 backdrop-blur-sm z-40 animate-fade-in">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                  <span className="text-white font-bold text-sm">W</span>
                </div>
                <h1 className="text-xl font-bold text-white">DeckSmith</h1>
              </div>
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Community
              </Button>
            </div>

            <div className="flex items-center space-x-3">
              <Button variant="ghost" className="text-white hover:bg-white/10">
                Login
              </Button>
              <Button variant="outline_primary">Sign Up</Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-8 relative z-10 animate-slide-up-delay-1 min-h-[calc(100vh-80px)] flex flex-col justify-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl md:text-5xl font-bold text-white mb-8">
            Build Your Ultimate
            <span className="flex items-center justify-center">
              <span className="ml-3 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Wizard101 PvP Strategy
              </span>
            </span>
          </h1>

          {/* Social Proof */}
          <div className="mb-6 w-full max-w-3xl">
            <div className="bg-black/20 backdrop-blur-md border border-white/20 rounded-xl px-8 py-3 shadow-xl">
              <div className="flex items-center justify-center space-x-8">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold text-lg">
                    ⭐️ Loved by{" "}
                    <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                      12,000+
                    </span>{" "}
                    <span>
                      {" "}
                      <Image
                        src="/Wizard101_logo.png"
                        alt="Wizard101"
                        width={100}
                        height={30}
                        className="inline-block"
                        priority
                      />
                    </span>{" "}
                    players worldwide ⭐️
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Demo Video */}
          <div className="mb-6 w-full max-w-2xl">
            <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-purple-900/40 to-blue-900/40 border border-white/30 backdrop-blur-sm shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02]">
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-4 mx-auto hover:bg-white/20 transition-all duration-300 cursor-pointer hover:scale-110">
                    <svg
                      className="w-8 h-8 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-white/60 text-lg">
                    Demo Video Coming Soon
                  </p>
                </div>
              </div>

              {/* Video overlay with stats */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="bg-black/50 backdrop-blur-sm rounded-xl px-6 py-4 flex items-center justify-between">
                  <div className="flex items-center space-x-6 text-white/90"></div>
                  <div className="text-white/60 font-mono">2:30</div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtitle and CTA */}
          <div>
            <p className="text-lg text-white/80 mb-6 max-w-2xl mx-auto">
              Create, share, and discover amazing deck builds from the Wiz
              community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/decks">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-3 font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105"
                >
                  Create New Deck
                </Button>
              </Link>
              <Button
                variant="outline_primary"
                size="lg"
                className="px-8 py-3 font-semibold hover:scale-105 transition-all duration-300"
              >
                Browse Community Decks
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 relative z-10 animate-fade-in-delay-5">
        <div className="container mx-auto px-4 py-6">
          <div className="text-center text-white/60">
            <p>&copy; 2024 DeckSmith. Build your legendary deck today.</p>
          </div>
        </div>
      </footer>

      {/* Add custom CSS for animations */}
      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fadeIn 0.8s ease-out;
        }

        .animate-slide-up-delay-1 {
          animation: slideUp 1s ease-out 0.2s both;
        }

        .animate-fade-in-delay-5 {
          animation: fadeIn 0.8s ease-out 1s both;
        }
      `}</style>
    </div>
  );
}

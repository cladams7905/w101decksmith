import HomeNavbar from "@/components/home/home-navbar";
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
      <HomeNavbar />

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-4 md:py-6 relative z-10 animate-slide-up-delay-1 min-h-[calc(100vh-80px)] flex flex-col justify-center">
        <div className="max-w-4xl mx-auto flex flex-col items-center justify-center text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 md:mb-6 leading-tight">
            Build the Ultimate
            <span className="flex flex-col sm:flex-row items-center justify-center mt-1 space-y-1 sm:space-y-0 sm:space-x-3">
              <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
                Wizard101 PvP Strat
              </span>
            </span>
          </h1>

          {/* Social Proof */}
          <div className="mb-3 md:mb-4 w-full max-w-2xl">
            <div className="bg-background/80 shadow-lg shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02] backdrop-blur-md border border-border rounded-xl px-3 md:px-6 py-2">
              {/* Mobile Layout */}
              <div className="md:hidden text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-white font-semibold text-sm">
                    ⭐️ Loved by{" "}
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      12,000+
                    </span>
                  </span>
                </div>
                <div className="flex items-center justify-center mb-1">
                  <Image
                    src="/Wizard101_logo.png"
                    alt="Wizard101"
                    width={60}
                    height={18}
                    className="inline-block"
                    priority
                  />
                </div>
                <div className="text-white text-xs">players worldwide ⭐️</div>
              </div>

              {/* Desktop Layout */}
              <div className="hidden md:flex items-center justify-center space-x-6">
                <div className="flex items-center space-x-2">
                  <span className="text-white font-semibold text-base">
                    ⭐️ Loved by{" "}
                    <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                      12,000+
                    </span>{" "}
                    <span>
                      {" "}
                      <Image
                        src="/Wizard101_logo.png"
                        alt="Wizard101"
                        width={80}
                        height={24}
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
          <div className="mb-3 md:mb-4 w-full max-w-xl">
            <div className="relative rounded-2xl overflow-hidden bg-background/80 border backdrop-blur-sm shadow-2xl shadow-purple-500/20 transition-all duration-500 hover:scale-[1.02]">
              <div className="aspect-video flex items-center justify-center">
                <div className="text-center">
                  <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mb-3 mx-auto hover:bg-white/20 transition-all duration-300 cursor-pointer hover:scale-110">
                    <svg
                      className="w-5 h-5 md:w-6 md:h-6 text-white ml-1"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-white/60 text-sm md:text-base">
                    Demo Video Coming Soon
                  </p>
                </div>
              </div>

              {/* Video overlay with stats */}
              <div className="absolute bottom-3 md:bottom-4 left-3 md:left-4 right-3 md:right-4">
                <div className="bg-black/50 backdrop-blur-sm rounded-xl px-3 md:px-4 py-2 md:py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-4 text-white/90"></div>
                  <div className="text-white/60 font-mono text-xs md:text-sm">
                    2:30
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Subtitle and CTA */}
          <div>
            <p className="text-sm md:text-base text-white/80 mb-3 md:mb-4 max-w-xl mx-auto px-4 md:px-0">
              Create, share, and discover amazing deck builds from the Wiz
              community.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center items-center px-4 md:px-0">
              <Link href="/create" className="w-full sm:w-auto">
                <Button
                  size="default"
                  className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-5 md:px-6 py-2 text-sm md:text-base font-semibold shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 hover:scale-105 w-full sm:w-auto"
                >
                  Create New Deck
                </Button>
              </Link>
              <Button
                variant="outline_primary"
                size="default"
                className="px-5 md:px-6 py-2 text-sm md:text-base font-semibold hover:scale-105 transition-all duration-300 w-full sm:w-auto"
              >
                Browse Community Decks
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 relative z-10 animate-fade-in-delay-5">
        <div className="container mx-auto px-4 py-4 md:py-6">
          <div className="text-center text-white/60">
            <p className="text-sm md:text-base">
              &copy; 2025 DeckSmith. Made with ❤️ by Carter Adams.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

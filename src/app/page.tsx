import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function Home() {
  return (
    <div className="gradient-special min-h-screen">
      {/* Header Navigation */}
      <header className="border-b border-white/10 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">W</span>
              </div>
              <h1 className="text-xl font-bold text-white">DeckSmith</h1>
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
      <main className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-white mb-6">
            Build Your Perfect
            <span className="block bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
              Wizard101 Deck
            </span>
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Create, share, and discover amazing deck builds with our intuitive
            deck builder. Join the community and perfect your strategy.
          </p>

          {/* Primary Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/decks">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg"
              >
                Create New Deck
              </Button>
            </Link>
            <Button
              variant="outline_primary"
              size="lg"
              className="px-8 py-4 text-lg"
            >
              Browse Community Decks
            </Button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="gradient-linear border-white/20 p-6 hover:border-purple-400/50 transition-all">
            <div className="w-12 h-12 rounded-lg bg-purple-600/20 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-purple-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Intuitive Builder
            </h3>
            <p className="text-white/70">
              Drag and drop cards with our user-friendly interface. Build decks
              quickly with smart suggestions and filters.
            </p>
          </Card>

          <Card className="gradient-linear border-white/20 p-6 hover:border-blue-400/50 transition-all">
            <div className="w-12 h-12 rounded-lg bg-blue-600/20 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-blue-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Community Driven
            </h3>
            <p className="text-white/70">
              Share your decks with the community, get feedback, and discover
              innovative strategies from other wizards.
            </p>
          </Card>

          <Card className="gradient-linear border-white/20 p-6 hover:border-green-400/50 transition-all">
            <div className="w-12 h-12 rounded-lg bg-green-600/20 flex items-center justify-center mb-4">
              <svg
                className="w-6 h-6 text-green-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">
              Advanced Analytics
            </h3>
            <p className="text-white/70">
              Analyze your deck&apos;s performance with detailed statistics,
              mana curves, and spell distribution insights.
            </p>
          </Card>
        </div>

        {/* Quick Actions Section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-white mb-8">
            Get Started Now
          </h3>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/decks">
              <Button className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-6">
                Start Building →
              </Button>
            </Link>
            <Link href="/community">
              <Button variant="outline_primary" className="px-6">
                Explore Decks
              </Button>
            </Link>
            <Link href="/auth">
              <Button
                variant="ghost"
                className="text-white hover:bg-white/10 px-6"
              >
                Join Community
              </Button>
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-white/60">
            <p>&copy; 2024 DeckSmith. Build your legendary deck today.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

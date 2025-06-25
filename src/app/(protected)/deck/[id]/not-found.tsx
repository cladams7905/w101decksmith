import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-4xl font-bold">404</h1>
      <h2 className="text-2xl font-semibold">Deck Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md">
        The deck you&apos;re looking for doesn&apos;t exist or you don&apos;t
        have permission to view it.
      </p>
      <div className="flex space-x-4">
        <Button asChild>
          <Link href="/my-decks">View My Decks</Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/create">Create New Deck</Link>
        </Button>
      </div>
    </div>
  );
}

import { notFound } from "next/navigation";
import { getDeckById } from "@/db/actions/decks";
import { DeckBuilderLayout } from "@/components/deck-builder/deck-builder-layout";
import { DeckProvider } from "@/lib/contexts/deck-context";
import { DeckPageProvider } from "@/components/deck-builder/deck-page-provider";

interface DeckPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function DeckPage({ params }: DeckPageProps) {
  const { id } = await params;
  const deckId = parseInt(id);

  if (isNaN(deckId)) {
    notFound();
  }

  let deck;
  try {
    deck = await getDeckById(deckId);
  } catch (error) {
    console.error("Error fetching deck:", error);
    notFound();
  }

  if (!deck) {
    notFound();
  }

  return (
    <DeckProvider deck={deck}>
      <DeckPageProvider>
        <DeckBuilderLayout />
      </DeckPageProvider>
    </DeckProvider>
  );
}

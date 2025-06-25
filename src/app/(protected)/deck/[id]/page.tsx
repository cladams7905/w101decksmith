import { notFound } from "next/navigation";
import { getDeckById } from "@/db/actions/decks";
import { DeckBuilderLayout } from "@/components/deck-builder/deck-builder-layout";
import { DeckProvider } from "@/lib/contexts/deck-context";
import { UIProvider } from "@/lib/contexts/ui-context";
import { SidebarProvider } from "@/components/ui/sidebar";

interface DeckPageProps {
  params: {
    id: string;
  };
}

export default async function DeckPage({ params }: DeckPageProps) {
  const deckId = parseInt(params.id);

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
      <UIProvider>
        <SidebarProvider>
          <DeckBuilderLayout />
        </SidebarProvider>
      </UIProvider>
    </DeckProvider>
  );
}

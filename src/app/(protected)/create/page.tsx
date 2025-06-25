"use client";

import { useState, useEffect } from "react";
import { DeckBuilderLayout } from "@/components/deck-builder/deck-builder-layout";
import { NewDeckModal } from "@/components/app-header/navigation/new-deck-modal";
import { useRouter } from "next/navigation";

export default function CreatePage() {
  const [showModal, setShowModal] = useState(false);
  const router = useRouter();

  // Automatically open the modal when the page loads
  useEffect(() => {
    setShowModal(true);
  }, []);

  // Handle modal close - redirect back to my-decks page
  const handleModalClose = (open: boolean) => {
    setShowModal(open);
    if (!open) {
      router.push("/my-decks");
    }
  };

  return (
    <div className="relative h-full w-full">
      {/* Blurred background using the deck builder layout */}
      <div className="absolute inset-0 blur-sm opacity-50 pointer-events-none">
        <DeckBuilderLayout />
      </div>

      {/* Dark overlay to enhance the blur effect */}
      <div className="absolute inset-0 bg-black/30 pointer-events-none" />

      {/* New Deck Modal - automatically opened */}
      <NewDeckModal
        showModal={showModal}
        setShowModal={handleModalClose}
        triggerButton={<div style={{ display: "none" }} />} // Hidden trigger since modal opens automatically
        disableOutsideClick={true}
        hideCloseButton={true}
      />
    </div>
  );
}

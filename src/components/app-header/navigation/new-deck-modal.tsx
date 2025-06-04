"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface NewDeckModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  // onCreateDeck: (
  //   name: string,
  //   school: string,
  //   level: string,
  //   weaving_school: string
  // ) => void;
  triggerButton: React.ReactNode;
}

export function NewDeckModal({
  showModal,
  setShowModal,
  // onCreateDeck,
  triggerButton
}: NewDeckModalProps) {
  const [newDeckName, setNewDeckName] = useState("");

  const handleCreateDeck = () => {
    if (newDeckName.trim()) {
      // onCreateDeck(newDeckName, "fire", "150", "pyromancer"); // Default values
      setNewDeckName("");
      setShowModal(false);
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 mt-4">
          <Input
            placeholder="Deck Name"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
          />
          <Button onClick={handleCreateDeck}>Create Deck</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

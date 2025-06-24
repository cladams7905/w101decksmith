"use client";

import type React from "react";

import { useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
  DialogPortal
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
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
  disableOutsideClick?: boolean;
  hideCloseButton?: boolean;
}

export function NewDeckModal({
  showModal,
  setShowModal,
  // onCreateDeck,
  triggerButton,
  disableOutsideClick = false,
  hideCloseButton = false
}: NewDeckModalProps) {
  const [newDeckName, setNewDeckName] = useState("");

  const handleCreateDeck = () => {
    if (newDeckName.trim()) {
      // onCreateDeck(newDeckName, "fire", "150", "pyromancer"); // Default values
      setNewDeckName("");
      setShowModal(false);
    }
  };

  // Custom DialogContent component to conditionally hide close button
  const CustomDialogContent = ({
    children,
    ...props
  }: React.ComponentProps<typeof DialogPrimitive.Content>) => (
    <DialogPortal>
      <DialogOverlay />
      <DialogPrimitive.Content
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-lg"
        )}
        {...props}
      >
        {children}
        {!hideCloseButton && (
          <DialogPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4">
            <svg
              className="size-4"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );

  return (
    <Dialog
      open={showModal}
      onOpenChange={disableOutsideClick ? undefined : setShowModal}
    >
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <CustomDialogContent>
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
      </CustomDialogContent>
    </Dialog>
  );
}

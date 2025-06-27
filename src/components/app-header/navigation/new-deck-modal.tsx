"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useDeck } from "@/lib/contexts/deck-context";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogOverlay,
  DialogPortal
} from "@/components/ui/dialog";
import * as DialogPrimitive from "@radix-ui/react-dialog";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { ChevronDown } from "lucide-react";

const SCHOOLS = [
  {
    value: "fire",
    label: "Fire",
    icon: "/school-icons/(Icon)_Fire_School.png"
  },
  { value: "ice", label: "Ice", icon: "/school-icons/(Icon)_Ice_School.png" },
  {
    value: "storm",
    label: "Storm",
    icon: "/school-icons/(Icon)_Storm_School.png"
  },
  {
    value: "myth",
    label: "Myth",
    icon: "/school-icons/(Icon)_Myth_School.png"
  },
  {
    value: "life",
    label: "Life",
    icon: "/school-icons/(Icon)_Life_School.png"
  },
  {
    value: "death",
    label: "Death",
    icon: "/school-icons/(Icon)_Death_School.png"
  },
  {
    value: "balance",
    label: "Balance",
    icon: "/school-icons/(Icon)_Balance_School.png"
  }
];

// Mock collections - replace with actual data from your API/database
const MOCK_COLLECTIONS = [
  { value: "pvp-builds", label: "PvP Builds" },
  { value: "pve-questing", label: "PvE Questing" },
  { value: "farming-decks", label: "Farming Decks" },
  { value: "tournament-ready", label: "Tournament Ready" },
  { value: "experimental", label: "Experimental" }
];

interface NewDeckModalProps {
  showModal: boolean;
  setShowModal: (show: boolean) => void;
  triggerButton: React.ReactNode;
  disableOutsideClick?: boolean;
  hideCloseButton?: boolean;
}

export function NewDeckModal({
  showModal,
  setShowModal,
  triggerButton,
  disableOutsideClick = false
}: NewDeckModalProps) {
  const router = useRouter();
  const { createNewDeck } = useDeck();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    school: "",
    level: 170,
    weavingSchool: "",
    description: "",
    isPvpDeck: true,
    visibility: "private" as "public" | "private",
    collections: [] as string[]
  });

  const handleInputChange = (
    field: string,
    value: string | number | boolean | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleCreateDeck = async () => {
    if (formData.name.trim() && formData.school) {
      setIsCreating(true);
      try {
        // Create the deck using context method
        const newDeck = await createNewDeck({
          name: formData.name,
          school: formData.school,
          level: formData.level,
          weavingSchool: formData.weavingSchool,
          description: formData.description,
          isPvpDeck: formData.isPvpDeck,
          isPublic: formData.visibility === "public",
          collections: formData.collections
        });

        if (newDeck) {
          // Reset form
          setFormData({
            name: "",
            school: "",
            level: 170,
            weavingSchool: "",
            description: "",
            isPvpDeck: true,
            visibility: "private",
            collections: []
          });

          // Close modal
          setShowModal(false);

          // Redirect to the new deck page
          router.push(`/deck/${newDeck.id}`);
        }
        // If newDeck is null, error was already handled by the context (toast shown)
      } catch (error) {
        console.error("Error creating deck:", error);
        // Error handling is done by the context method
      } finally {
        setIsCreating(false);
      }
    }
  };

  const handleClose = () => {
    router.back();
    setShowModal(false);
  };

  return (
    <Dialog
      open={showModal}
      onOpenChange={(open) => {
        if (!disableOutsideClick) {
          if (!open) {
            // Modal is closing, navigate back
            router.back();
          }
          setShowModal(open);
        }
      }}
    >
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogPortal>
        <DialogOverlay />
        <DialogPrimitive.Content className="bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Deck</DialogTitle>
          </DialogHeader>
          <DialogPrimitive.Close
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
            onClick={handleClose}
          >
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
          <div className="space-y-6 mt-4">
            {/* Deck Name */}
            <div className="space-y-2">
              <Label htmlFor="deck-name">Deck Name</Label>
              <Input
                id="deck-name"
                placeholder="Enter deck name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
              />
            </div>

            {/* School and Level Row */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="school">School</Label>
                <Select
                  value={formData.school}
                  onValueChange={(value) => handleInputChange("school", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select school" />
                  </SelectTrigger>
                  <SelectContent>
                    {SCHOOLS.map((school) => (
                      <SelectItem key={school.value} value={school.value}>
                        <div className="flex items-center gap-2">
                          <Image
                            src={school.icon}
                            alt={school.label}
                            width={20}
                            height={20}
                            className="shrink-0"
                          />
                          {school.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="level">Level (10-170)</Label>
                <Input
                  id="level"
                  type="number"
                  min={10}
                  max={170}
                  value={formData.level}
                  onChange={(e) =>
                    handleInputChange(
                      "level",
                      Math.max(
                        10,
                        Math.min(170, parseInt(e.target.value) || 170)
                      )
                    )
                  }
                />
              </div>
            </div>

            {/* Weaving School */}
            <div className="space-y-2">
              <Label htmlFor="weaving-school">Weaving School (Optional)</Label>
              <Select
                value={formData.weavingSchool}
                onValueChange={(value) =>
                  handleInputChange("weavingSchool", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select weaving school" />
                </SelectTrigger>
                <SelectContent>
                  {SCHOOLS.map((school) => (
                    <SelectItem key={school.value} value={school.value}>
                      <div className="flex items-center gap-2">
                        <Image
                          src={school.icon}
                          alt={school.label}
                          width={20}
                          height={20}
                          className="shrink-0"
                        />
                        {school.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Collections */}
            <div className="space-y-2">
              <Label htmlFor="collections">Collections (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between"
                  >
                    {formData.collections.length === 0
                      ? "Select collections..."
                      : `${formData.collections.length} collection${
                          formData.collections.length === 1 ? "" : "s"
                        } selected`}
                    <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                  <div className="p-4 space-y-2">
                    {MOCK_COLLECTIONS.map((collection) => (
                      <div
                        key={collection.value}
                        className="flex items-center space-x-2"
                      >
                        <Checkbox
                          id={`collection-${collection.value}`}
                          checked={formData.collections.includes(
                            collection.value
                          )}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              handleInputChange("collections", [
                                ...formData.collections,
                                collection.value
                              ]);
                            } else {
                              handleInputChange(
                                "collections",
                                formData.collections.filter(
                                  (c) => c !== collection.value
                                )
                              );
                            }
                          }}
                        />
                        <Label
                          htmlFor={`collection-${collection.value}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                        >
                          {collection.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                placeholder="Describe your deck (max 200 characters)"
                maxLength={200}
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                className="resize-none"
              />
              <div className="text-xs text-muted-foreground text-right">
                {formData.description.length}/200
              </div>
            </div>

            {/* Radio Button Sections */}
            <div className="space-y-4">
              {/* Deck Type Radio Buttons */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Deck Type</Label>
                <RadioGroup
                  value={formData.isPvpDeck ? "pvp" : "pve"}
                  onValueChange={(value: string) => {
                    handleInputChange("isPvpDeck", value === "pvp");
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem
                      value="pvp"
                      id="deck-type-pvp"
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="deck-type-pvp"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        PvP Deck
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        For player vs player combat
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem
                      value="pve"
                      id="deck-type-pve"
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="deck-type-pve"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        PvE Deck
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        For questing and PvE content
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Visibility Radio Buttons */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Deck Visibility</Label>
                <RadioGroup
                  value={formData.visibility}
                  onValueChange={(value: "public" | "private") => {
                    handleInputChange("visibility", value);
                  }}
                  className="grid grid-cols-2 gap-4"
                >
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem
                      value="private"
                      id="visibility-private"
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="visibility-private"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Private
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Only you can see this deck
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-2">
                    <RadioGroupItem
                      value="public"
                      id="visibility-public"
                      className="mt-0.5"
                    />
                    <div className="space-y-1">
                      <Label
                        htmlFor="visibility-public"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                      >
                        Public
                      </Label>
                      <p className="text-xs text-muted-foreground">
                        Anyone can view and comment on this deck
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>
            </div>

            {/* Create Button */}
            <Button
              onClick={handleCreateDeck}
              className="w-full"
              disabled={!formData.name.trim() || !formData.school || isCreating}
            >
              {isCreating ? "Creating Deck..." : "Create Deck"}
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  );
}

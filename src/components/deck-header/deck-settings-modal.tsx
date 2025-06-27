"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Check, X, Loader2 } from "lucide-react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from "@/components/ui/popover";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import type { Deck } from "@/db/database.types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger
} from "@/components/ui/alert-dialog";
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

interface DeckSettingsModalProps {
  currentDeck: Deck;
  decks: Deck[];
  onUpdateDeck: (updatedDeck: Partial<Deck>) => void;
  onDeleteDeck: () => void;
}

type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

export function DeckSettingsModal({
  currentDeck,
  decks,
  onUpdateDeck,
  onDeleteDeck
}: DeckSettingsModalProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: currentDeck?.name || "",
    school: currentDeck?.school || "fire",
    level: currentDeck?.level || 170,
    weavingSchool: currentDeck?.weaving_school || "",
    description: currentDeck?.description || "",
    isPvpDeck: currentDeck ? !currentDeck.is_pve : true,
    visibility: currentDeck?.is_public
      ? ("public" as const)
      : ("private" as const),
    collections: [] as string[] // TODO: Get from deck data when available
  });

  const [autoSaveStatus, setAutoSaveStatus] = useState<AutoSaveStatus>("idle");
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const initialFormDataRef = useRef<string>("");
  const hasInitializedRef = useRef(false);
  const formDataRef = useRef(formData);
  const onUpdateDeckRef = useRef(onUpdateDeck);

  // Keep refs up to date
  useEffect(() => {
    formDataRef.current = formData;
  }, [formData]);

  useEffect(() => {
    onUpdateDeckRef.current = onUpdateDeck;
  }, [onUpdateDeck]);

  // Initialize the initial form data reference once when the modal opens
  useEffect(() => {
    if (!hasInitializedRef.current && currentDeck) {
      const initialData = {
        name: currentDeck.name || "",
        school: currentDeck.school || "fire",
        level: currentDeck.level || 170,
        weavingSchool: currentDeck.weaving_school || "",
        description: currentDeck.description || "",
        isPvpDeck: !currentDeck.is_pve,
        visibility: currentDeck.is_public
          ? ("public" as const)
          : ("private" as const),
        collections: [] as string[]
      };
      initialFormDataRef.current = JSON.stringify(initialData);
      hasInitializedRef.current = true;
    }
  }, [currentDeck]);

  // Auto-save functionality - using refs to avoid dependency issues
  const performAutoSave = useCallback(async () => {
    setAutoSaveStatus("saving");

    try {
      const currentFormData = formDataRef.current;
      await onUpdateDeckRef.current({
        name: currentFormData.name,
        school: currentFormData.school,
        level: currentFormData.level,
        weaving_school: currentFormData.weavingSchool
          ? (currentFormData.weavingSchool as typeof currentFormData.school)
          : null,
        description: currentFormData.description || null,
        is_pve: !currentFormData.isPvpDeck,
        is_public: currentFormData.visibility === "public"
      });

      setAutoSaveStatus("saved");

      // Reset to idle after 2 seconds
      setTimeout(() => {
        setAutoSaveStatus("idle");
      }, 2000);
    } catch (error) {
      setAutoSaveStatus("error");
      console.error("Error auto-saving deck:", error);

      // Reset to idle after 5 seconds on error
      setTimeout(() => {
        setAutoSaveStatus("idle");
      }, 5000);
    }
  }, []); // No dependencies - uses refs

  const handleInputChange = (
    field: string,
    value: string | number | boolean | string[]
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // Set up auto-save whenever formData changes
  useEffect(() => {
    // Don't trigger auto-save if we haven't initialized the reference yet
    if (!hasInitializedRef.current) {
      return;
    }

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Only set up auto-save if formData actually changed from initial state
    const currentFormDataString = JSON.stringify(formData);
    const formDataChanged =
      initialFormDataRef.current !== currentFormDataString;

    if (formDataChanged) {
      // Set up auto-save after 2 seconds of inactivity
      timeoutRef.current = setTimeout(() => {
        performAutoSave();
      }, 2000);
    }

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [formData, performAutoSave]);

  // Get appropriate icon and color based on status
  const getStatusDisplay = () => {
    switch (autoSaveStatus) {
      case "saving":
        return {
          icon: <Loader2 className="h-3 w-3 animate-spin" />,
          text: "Saving...",
          color: "text-blue-500"
        };
      case "saved":
        return {
          icon: <Check className="h-3 w-3" />,
          text: "Saved",
          color: "text-green-500"
        };
      case "error":
        return {
          icon: <X className="h-3 w-3" />,
          text: "Error",
          color: "text-red-500"
        };
      default:
        return {
          icon: null,
          text: "",
          color: "text-muted-foreground"
        };
    }
  };

  const handleDeleteDeck = () => {
    // If this is the last deck, redirect to my-decks page after deletion
    if (decks.length <= 1) {
      onDeleteDeck();
      router.push("/my-decks");
    } else {
      onDeleteDeck();
    }
  };

  const statusDisplay = getStatusDisplay();

  // Don't render if currentDeck is not available
  if (!currentDeck) {
    return null;
  }

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex items-center justify-between">
          <DialogTitle>Deck Settings</DialogTitle>
          <div
            className={`flex items-center gap-1 text-xs ${statusDisplay.color}`}
          >
            {statusDisplay.icon}
            <span>{statusDisplay.text}</span>
          </div>
        </div>
      </DialogHeader>
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
                  Math.max(10, Math.min(170, parseInt(e.target.value) || 170))
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
            onValueChange={(value) => handleInputChange("weavingSchool", value)}
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
                      checked={formData.collections.includes(collection.value)}
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
            onChange={(e) => handleInputChange("description", e.target.value)}
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

        {/* Delete Button */}
        <div className="pt-6">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">Delete Deck</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your deck &ldquo;{currentDeck.name}&rdquo;.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDeleteDeck}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Deck
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </DialogContent>
  );
}

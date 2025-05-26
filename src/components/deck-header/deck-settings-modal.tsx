"use client";

import {
  DialogContent,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import type { Deck } from "@/lib/types";
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

interface DeckSettingsModalProps {
  wizardLevel: string;
  setWizardLevel: (level: string) => void;
  wizardSchool: string;
  setWizardSchool: (school: string) => void;
  weavingClass: string;
  setWeavingClass: (weavingClass: string) => void;
  decks: Deck[];
  onDeleteDeck: () => void;
}

export function DeckSettingsModal({
  wizardLevel,
  setWizardLevel,
  wizardSchool,
  setWizardSchool,
  weavingClass,
  setWeavingClass,
  decks,
  onDeleteDeck
}: DeckSettingsModalProps) {
  return (
    <DialogContent>
      <DialogHeader>
        <DialogTitle>Deck Settings</DialogTitle>
      </DialogHeader>
      <div className="space-y-4 mt-4 w-full">
        <div className="space-y-2 w-full">
          <Label htmlFor="wizard-level">Wizard Level</Label>
          <Select value={wizardLevel} onValueChange={setWizardLevel}>
            <SelectTrigger id="wizard-level">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {[50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160].map(
                (level) => (
                  <SelectItem key={level} value={level.toString()}>
                    Level {level}
                  </SelectItem>
                )
              )}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2 w-full">
          <Label htmlFor="wizard-school">Wizard School</Label>
          <Select value={wizardSchool} onValueChange={setWizardSchool}>
            <SelectTrigger id="wizard-school">
              <SelectValue placeholder="Select school" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fire">Fire</SelectItem>
              <SelectItem value="ice">Ice</SelectItem>
              <SelectItem value="storm">Storm</SelectItem>
              <SelectItem value="myth">Myth</SelectItem>
              <SelectItem value="life">Life</SelectItem>
              <SelectItem value="death">Death</SelectItem>
              <SelectItem value="balance">Balance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="weaving-class">Weaving Class</Label>
          <Select value={weavingClass} onValueChange={setWeavingClass}>
            <SelectTrigger id="weaving-class">
              <SelectValue placeholder="Select weaving class" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pyromancer">Pyromancer</SelectItem>
              <SelectItem value="thaumaturge">Thaumaturge</SelectItem>
              <SelectItem value="diviner">Diviner</SelectItem>
              <SelectItem value="conjurer">Conjurer</SelectItem>
              <SelectItem value="theurgist">Theurgist</SelectItem>
              <SelectItem value="necromancer">Necromancer</SelectItem>
              <SelectItem value="sorcerer">Sorcerer</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="pt-6 mt-6 border-t">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="destructive"
                disabled={decks.length <= 1}
                className="w-full"
              >
                Delete Deck
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  your deck.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={onDeleteDeck}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete Deck
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          {decks.length <= 1 && (
            <p className="text-xs text-muted-foreground mt-2">
              You cannot delete your only deck. Create another deck first.
            </p>
          )}
        </div>
      </div>
    </DialogContent>
  );
}

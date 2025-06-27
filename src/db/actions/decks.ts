"use server";

import { createClient } from "../supabase/server";
import { Deck, DeckInsert, DeckUpdate, School } from "@/db/database.types";

export async function getAllDecks(): Promise<Deck[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("decks").select("*");

  if (error) throw error;
  return data || [];
}

export async function getDeckById(id: number): Promise<Deck> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("id", id)
    .single();

  if (error) throw error;
  return data;
}

export async function getDecksByUserId(userId: string): Promise<Deck[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("user_id", userId);

  if (error) throw error;
  return data || [];
}

export async function getPublicDecks(): Promise<Deck[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("decks")
    .select("*")
    .eq("is_public", true);

  if (error) throw error;
  return data || [];
}

export async function insertDeck(deck: DeckInsert): Promise<Deck> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("decks")
    .insert(deck)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function createDeck(deckData: {
  name: string;
  school: string;
  level: number;
  weavingSchool: string;
  description?: string;
  isPvpDeck: boolean;
  isPublic: boolean;
  collections: string[];
}): Promise<Deck> {
  const supabase = await createClient();

  // Get current user
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser();
  if (userError || !user) {
    throw new Error("User not authenticated");
  }

  // Process weaving school to handle empty strings
  const processedWeavingSchool =
    deckData.weavingSchool && deckData.weavingSchool.trim().length > 0
      ? (deckData.weavingSchool as School)
      : null;

  // Prepare deck data for insertion
  const deckInsert: DeckInsert = {
    name: deckData.name,
    school: deckData.school as School,
    level: deckData.level,
    weaving_school: processedWeavingSchool,
    description: deckData.description || null,
    is_pve: !deckData.isPvpDeck, // Note: is_pve is the inverse of isPvpDeck
    is_public: deckData.isPublic,
    user_id: user.id,
    spells: [] // Start with empty spells array
  };

  const { data, error } = await supabase
    .from("decks")
    .insert(deckInsert)
    .select()
    .single();

  if (error) throw error;

  // TODO: Handle collections if you have a collections table
  // For now, we'll ignore the collections array

  return data;
}

export async function updateDeck(
  id: number,
  updates: DeckUpdate
): Promise<Deck> {
  const supabase = await createClient();

  // Handle weaving_school if it's being updated
  const processedUpdates = { ...updates };
  if (
    "weaving_school" in processedUpdates &&
    typeof processedUpdates.weaving_school === "string"
  ) {
    processedUpdates.weaving_school = processedUpdates.weaving_school.trim()
      ? (processedUpdates.weaving_school as School)
      : null;
  }

  const { data, error } = await supabase
    .from("decks")
    .update(processedUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteDeck(id: number): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.from("decks").delete().eq("id", id);

  if (error) throw error;
}

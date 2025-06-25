"use server";

import { createClient } from "../supabase/server";
import {
  Database,
  Deck,
  DeckInsert,
  DeckUpdate,
  School
} from "@/db/database.types";

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
  canComment: boolean;
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

  // Prepare deck data for insertion
  const deckInsert: DeckInsert = {
    name: deckData.name,
    school: deckData.school as School,
    level: deckData.level,
    weaving_school: deckData.weavingSchool as School | null,
    description: deckData.description || null,
    is_pve: !deckData.isPvpDeck, // Note: is_pve is the inverse of isPvpDeck
    is_public: deckData.isPublic,
    can_comment: deckData.canComment,
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
  const { data, error } = await supabase
    .from("decks")
    .update(updates)
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

export async function updateDeckSpells(
  id: number,
  spells: Database["public"]["Tables"]["decks"]["Row"]["spells"]
): Promise<Deck> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("decks")
    .update({ spells })
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

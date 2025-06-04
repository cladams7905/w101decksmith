"use server";

import { createClient } from "../supabase/server";
import { Deck, DeckInsert, DeckUpdate } from "@/db/database.types";
import { Database } from "../database.types";

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

"use server";

import { supabase } from "../supabase";
import { Spell, SpellInsert, SpellUpdate } from "@/lib/types";

export async function getAllSpells(): Promise<Spell[]> {
  const { data, error } = await supabase.from("spells").select("*");

  if (error) throw error;
  return data || [];
}

export async function getSpellByName(name: string): Promise<Spell> {
  const { data, error } = await supabase
    .from("spells")
    .select("*")
    .eq("name", name)
    .single();

  if (error) throw error;
  return data;
}

export async function insertSpell(spell: SpellInsert): Promise<Spell> {
  const { data, error } = await supabase
    .from("spells")
    .insert(spell)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateSpell(
  id: number,
  updates: SpellUpdate
): Promise<Spell> {
  const { data, error } = await supabase
    .from("spells")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteSpell(id: number): Promise<void> {
  const { error } = await supabase.from("spells").delete().eq("id", id);

  if (error) throw error;
}

export async function upsertSpell(spell: SpellInsert): Promise<Spell> {
  const { data, error } = await supabase
    .from("spells")
    .upsert(spell, {
      onConflict: "name",
      ignoreDuplicates: false
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

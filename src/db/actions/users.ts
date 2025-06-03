"use server";

import { createClient } from "../supabase/server";

export async function checkIfUserExists(email: string): Promise<boolean> {
  const supabase = await createClient();
  const result = await supabase.from("users").select("*").eq("email", email);
  return (result.data?.length ?? 0) > 0;
}

"use server";

import { supabase } from "@/db/supabase";
import { AuthError, AuthResponse } from "@supabase/supabase-js";
import { getURL } from "./utils";

export async function signUpWithEmailAndPassword(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const url = await getURL();

  const result = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${url}/api/auth/confirm?next=/my-decks`
    }
  });

  return result;
}

export async function signInWithEmailAndPassword(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const result = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  });
  return result;
}

export async function resendConfirmationEmail(email: string): Promise<{
  error: AuthError | null;
}> {
  const url = await getURL();

  const result = await supabase.auth.resend({
    type: "signup",
    email: email,
    options: {
      emailRedirectTo: `${url}/api/auth/confirm?next=/my-decks`
    }
  });
  return result;
}

export async function signInWithGoogle() {
  const url = await getURL();

  const result = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent"
      },
      redirectTo: `${url}/api/auth/callback`
    }
  });
  return result;
}

export async function signOut(): Promise<{
  error: AuthError | null;
}> {
  const result = await supabase.auth.signOut();
  return result;
}

export async function getRedirectPathname(): Promise<string> {
  return `/my-decks`;
}

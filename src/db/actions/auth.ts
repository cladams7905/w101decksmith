"use server";

import { getUrl } from "@/lib/utils";
import { AuthError, AuthResponse } from "@supabase/supabase-js";
import { createClient } from "../supabase/server";

const REDIRECT_PATHNAME = "/home";

export async function signUpWithEmailAndPassword(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const supabase = await createClient();
  const result = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      emailRedirectTo: `${getUrl()}/auth/confirm?next=${REDIRECT_PATHNAME}`
    }
  });

  return result;
}

export async function signInWithEmailAndPassword(data: {
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const supabase = await createClient();
  const result = await supabase.auth.signInWithPassword({
    email: data.email,
    password: data.password
  });
  return result;
}

export async function resendConfirmationEmail(email: string): Promise<{
  error: AuthError | null;
}> {
  const supabase = await createClient();
  const result = await supabase.auth.resend({
    type: "signup",
    email: email,
    options: {
      emailRedirectTo: `${getUrl()}/auth/confirm?next=${REDIRECT_PATHNAME}`
    }
  });
  return result;
}

export async function signInWithGoogle() {
  const supabase = await createClient();
  const result = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      queryParams: {
        access_type: "offline",
        prompt: "consent"
      },
      redirectTo: `${getUrl()}/api/auth/callback`
    }
  });
  return result;
}

export async function signInWithTwitch() {
  const supabase = await createClient();
  const result = await supabase.auth.signInWithOAuth({
    provider: "twitch",
    options: {
      redirectTo: `${getUrl()}/api/auth/callback`
    }
  });
  return result;
}

export async function signInWithDiscord() {
  const supabase = await createClient();
  const result = await supabase.auth.signInWithOAuth({
    provider: "discord",
    options: {
      redirectTo: `${getUrl()}/api/auth/callback`
    }
  });
  return result;
}

export async function signOut(): Promise<{
  error: AuthError | null;
}> {
  const supabase = await createClient();
  const result = await supabase.auth.signOut();
  return result;
}

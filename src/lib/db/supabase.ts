import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
import { Database } from "./database.types";

// Load environment variables from .env.local file when not in Next.js
if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
  dotenv.config({ path: ".env.local" });
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    "Missing Supabase credentials. Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are set in .env.local"
  );
}

// Create the regular client
export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Create the admin client with service role
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

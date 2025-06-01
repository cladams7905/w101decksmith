import { supabase } from "@/db/supabase";
import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = getPathFromUrl(searchParams.get("next"));

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete("token_hash");
  redirectTo.searchParams.delete("type");
  redirectTo.searchParams.delete("next");

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash
    });
    if (!error) {
      return NextResponse.redirect(redirectTo);
    }
  }

  return NextResponse.json({ error: "Invalid token" }, { status: 400 });
}

function getPathFromUrl(url: string | null) {
  if (url) {
    const parsedUrl = new URL(url);
    // Remove leading slash from pathname and return it
    return parsedUrl.pathname.substring(1);
  } else {
    return "/";
  }
}

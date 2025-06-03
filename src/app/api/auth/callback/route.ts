import { NextResponse } from "next/server";
import { createClient } from "@/db/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") || "/home";

  // Check for email verification tokens
  const token_hash =
    searchParams.get("token_hash") || searchParams.get("token");
  const type = searchParams.get("type") as EmailOtpType | null;

  const supabase = await createClient();

  // Handle OAuth code exchange
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return getRedirectResponse(request, origin, next);
    }
  }

  // Handle email verification
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      type,
      token_hash
    });
    if (!error) {
      return getRedirectResponse(request, origin, next);
    }
  }

  // Return user to error page or home with error indication
  return NextResponse.redirect(`${origin}/?error=auth_callback_error`);
}

function getRedirectResponse(request: Request, origin: string, next: string) {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const isLocalEnv = process.env.NODE_ENV === "development";

  if (isLocalEnv) {
    // Local development - redirect directly
    return NextResponse.redirect(`${origin}${next}`);
  } else if (forwardedHost) {
    // Production with load balancer
    return NextResponse.redirect(`https://${forwardedHost}${next}`);
  } else {
    // Production fallback
    return NextResponse.redirect(`${origin}${next}`);
  }
}

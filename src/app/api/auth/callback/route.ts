import { getRedirectPathname } from "@/db/actions/auth";
import { supabase } from "@/db/supabase";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const forwardedHost = request.headers.get("x-forwarded-host"); // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === "development";
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${await getRedirectPathname()}`);
      } else if (forwardedHost) {
        return NextResponse.redirect(
          `https://${forwardedHost}${await getRedirectPathname()}`
        );
      } else {
        return NextResponse.redirect(`${origin}${await getRedirectPathname()}`);
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.json({ error: "Invalid code" }, { status: 400 });
}

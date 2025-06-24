import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const UNPROTECTED_ROUTES = ["/auth", "/"];

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({
            request
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  // Do not run code between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  // IMPORTANT: DO NOT REMOVE auth.getUser()

  const {
    data: { user }
  } = await supabase.auth.getUser();

  // Now we can safely add logging and logic after getUser()
  console.log("Middleware running for:", request.nextUrl.pathname);
  console.log("User:", user ? "logged in" : "not logged in");

  // If the user is not logged in and the route is protected, redirect to the login page
  if (
    !user &&
    !UNPROTECTED_ROUTES.some((route) => request.nextUrl.pathname === route)
  ) {
    console.log("Redirecting unauthenticated user to /");
    return NextResponse.redirect(new URL("/", request.url));
  }

  // If the user is logged in and the route is unprotected, redirect to protected area
  // But don't redirect if they're already on the target route
  if (
    user &&
    UNPROTECTED_ROUTES.some((route) => request.nextUrl.pathname === route) &&
    !(request.nextUrl.pathname === "/my-decks")
  ) {
    console.log("Redirecting authenticated user to /my-decks");
    return NextResponse.redirect(new URL("/my-decks", request.url));
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse;
}

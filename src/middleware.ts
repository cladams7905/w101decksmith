import { type NextRequest } from "next/server";
import { updateSession } from "./db/supabase/middleware";

export async function middleware(request: NextRequest) {
  console.log("======MIDDLEWARE=======");
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Match all paths EXCEPT:
    // - _next/static
    // - _next/image
    // - favicon.ico
    // - Static assets (.js, .css, .json, images, fonts, etc.)
    // - API routes (/api/*)
    // - Auth routes (/auth/*)
    "/((?!_next/static|_next/image|favicon.ico|api/|auth/|.*\\.(?:js|css|svg|png|jpg|jpeg|gif|webp|woff|woff2|ttf|eot|txt|ico|json)$).*)"
  ]
};

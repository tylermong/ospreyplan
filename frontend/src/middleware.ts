/**
 * Next.js middleware to protect internal routes.
 *
 * Behavior:
 * - If the request path is public, allow it.
 * - Otherwise, require the 'sb-access-token' cookie.
 *   - If missing, redirect to '/'.
 *   - If present, allow the request to continue.
 *
 * Notes:
 * - 'matcher' defines which requests this middleware runs on, excluding static assets and common file types.
 * - Within those matched requests, 'PUBLIC_PATHS' allow specific paths to bypass the auth check.
 * - The 'sb-access-token' cookie is set by the backend after successful OAuth.
 */
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

// Public routes that do not require authentication
const PUBLIC_PATHS = new Set(["/", "/auth/callback"]);

// Redirect unauthenticated requests to '/'
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // If the path is public, allow it
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  // Otherwise (i.e. not public), require the 'sb-access-token' cookie. If the cookie is missing, redirect to '/'.
  const token = req.cookies.get("sb-access-token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
}

// Apply to all app routes except static assets and common file types
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map)$).*)",
  ],
};

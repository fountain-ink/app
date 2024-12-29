import { type NextRequest } from "next/server";
import { setSupabaseSession } from "./lib/supabase/middleware";

export async function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken");
  const response = await setSupabaseSession(request);

  if (refreshToken) {
    response.headers.set("x-refresh-token", refreshToken.value);
  }

  response.headers.set("x-url", request.url);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};

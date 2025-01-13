import { NextResponse, type NextRequest } from "next/server";

const allowedOrigins = [
  /^https?:\/\/(?:[\w-]+\.)*lens\.dev$/,
  /^https?:\/\/(?:[\w-]+\.)*fountain\.ink$/,
  /^https?:\/\/(?:[\w-]+\.)*vercel\.app$/,
];

export async function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get("refreshToken");
  const appToken = request.cookies.get("appToken");
  const origin = request.headers.get("origin");
  
  // Handle preflight requests
  if (request.method === "OPTIONS") {
    const response = new NextResponse(null, { status: 204 });
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "*");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set("Access-Control-Max-Age", "86400"); // 24 hours

    if (origin) {
      const isAllowedOrigin = allowedOrigins.some(pattern => pattern.test(origin));
      if (isAllowedOrigin) {
        response.headers.set("Access-Control-Allow-Origin", origin);
      }
    }
    return response;
  }

  const response = NextResponse.next({
    request,
  });

  // Set CORS headers for all responses
  if (origin) {
    const isAllowedOrigin = allowedOrigins.some(pattern => pattern.test(origin));
    if (isAllowedOrigin) {
      response.headers.set("Access-Control-Allow-Origin", origin);
      response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
      response.headers.set("Access-Control-Allow-Headers", "*");
      response.headers.set("Access-Control-Allow-Credentials", "true");
    }
  } else {
    // If no origin, set permissive headers for API requests
    response.headers.set("Access-Control-Allow-Origin", "*");
    response.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    response.headers.set("Access-Control-Allow-Headers", "*");
  }

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

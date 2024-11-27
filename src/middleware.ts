import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const refreshToken = request.cookies.get("refreshToken");
  
  if (refreshToken) {
    response.headers.set("x-refresh-token", refreshToken.value);
  }
  
  response.headers.set('x-url', request.url);

  return response;
}

export const config = {
  matcher: "/write/:path*",
};

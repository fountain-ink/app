import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const response = NextResponse.next();
  const refreshToken = request.cookies.get("refreshToken");

  if (refreshToken) {
    response.headers.set("x-refresh-token", refreshToken.value);
  }

  response.headers.set("x-url", request.url);

  return response;
}

export const config = {
  matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
};

// import { type NextRequest, NextResponse } from "next/server";

// const PROD_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "fountain.ink";
// const DEV_DOMAIN = "localhost:3000";

// export default async function middleware(req: NextRequest) {
//   const url = req.nextUrl;
//   const hostname = req.headers.get("host") ?? DEV_DOMAIN;

//   const searchParams = url.searchParams.toString();
//   const path = `${url.pathname}${searchParams.length > 0 ? `?${searchParams}` : ""}`;

//   const currentDomain = hostname.includes("localhost") ? DEV_DOMAIN : PROD_DOMAIN;

//   const isSubdomain =
//     hostname !== currentDomain && (hostname.endsWith(`.${PROD_DOMAIN}`) || hostname.includes(".localhost:"));

//   const refreshToken = req.cookies.get("refreshToken");
//   let response = NextResponse.next();

//   if (isSubdomain) {
//     const parts = hostname.split(".");
//     const isDevOrStaging = parts.includes("dev") || parts.includes("staging");

//     let username: string;
//     let targetDomain: string;

//     if (isDevOrStaging) {
//       // For user.dev.domain.com -> dev.domain.com/u/user
//       username = parts[0] ?? "";
//       targetDomain = parts.slice(1).join(".");
//     } else {
//       // For user.domain.com -> domain.com/u/user
//       username = hostname.replace(`.${PROD_DOMAIN}`, "").replace(".localhost:3000", "");
//       targetDomain = currentDomain;
//     }

//     const redirectUrl = new URL(
//       `/u/${username}${path}`,
//       `${hostname.includes("localhost") ? "http" : "https"}://${targetDomain}`,
//     );

//     response = NextResponse.redirect(redirectUrl);
//   }

//   response.headers.set("x-url", req.url);
//   if (refreshToken) {
//     response.headers.set("x-refresh-token", refreshToken.value);
//   }

//   return response;
// }

// export const config = {
//   matcher: ["/((?!api/|_next/|_static/|_vercel|[\\w-]+\\.\\w+).*)"],
// };

import { type NextRequest, NextResponse } from "next/server";

export async function setSupabaseSession(request: NextRequest) {
  const appToken = request.cookies.get("appToken");

  const response = NextResponse.next({
    request,
  });

  if (appToken?.value) {
    response.headers.set("Authorization", `Bearer ${appToken.value}`);
  }

  return response;
}

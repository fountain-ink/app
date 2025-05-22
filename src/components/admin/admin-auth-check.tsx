import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { isAdmin } from "@/lib/auth/is-admin";
import { redirect } from "next/navigation";

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

export default function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const appToken = getAppToken();
  const claims = getTokenClaims(appToken);

  if (!claims || !isAdmin(claims.sub)) {
    redirect("/");
  }

  return <>{children}</>;
}

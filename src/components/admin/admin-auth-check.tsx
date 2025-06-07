import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { isAdmin } from "@/lib/auth/is-admin";
import { redirect } from "next/navigation";

interface AdminAuthCheckProps {
  children: React.ReactNode;
}

export default async function AdminAuthCheck({ children }: AdminAuthCheckProps) {
  const appToken = getAppToken();
  const claims = getTokenClaims(appToken);
  const userIsAdmin = await isAdmin(claims?.sub);

  if (!claims || !userIsAdmin) {
    redirect("/");
  }

  return <>{children}</>;
}

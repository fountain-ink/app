import { ThemeSettings } from "@/components/settings/settings-theme";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { getBlogData } from "@/lib/settings/get-user-metadata";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Theme Settings",
};

export default async function ThemeSettingsPage() {
  const appToken = getAppToken();
  const claims = getTokenClaims(appToken);

  if (!claims) {
    return notFound();
  }

  const metadata = await getBlogData(claims.sub);

  return <ThemeSettings initialMetadata={metadata ?? {}} />;
}

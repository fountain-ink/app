import { ApplicationSettings } from "@/components/settings/settings-app";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { getEmail } from "@/lib/settings/get-user-email";
import { getUserSettings } from "@/lib/settings/get-user-settings";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Application Settings",
};

export default async function AppSettingsPage() {
  const appToken = getAppToken();
  const claims = getTokenClaims(appToken);

  if (!claims) {
    return notFound();
  }

  const settings = (await getUserSettings(claims.metadata.address)) ?? {};
  const email = (await getEmail(claims.metadata.address)) ?? "";

  return <ApplicationSettings initialSettings={settings} initialEmail={email} />;
}

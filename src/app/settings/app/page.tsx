import { ApplicationSettings } from "@/components/settings/settings-app";
import { getSettings } from "@/lib/settings/get-private-settings";
import { getEmail } from "@/lib/settings/get-email";

export const metadata = {
  title: "Application Settings",
};

export default async function AppSettingsPage() {
  const settings = await getSettings() ?? {};
  const email = await getEmail() ?? "";

  return <ApplicationSettings initialSettings={settings} initialEmail={email} />;
}

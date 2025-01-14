import { ApplicationSettings } from "@/components/settings/settings-app";
import { getSettings } from "@/lib/settings/get-settings";

export const metadata = {
  title: "Application Settings",
};

export default async function AppSettingsPage() {
  const settings = await getSettings();

  return <ApplicationSettings initialSettings={settings?.metadata} initialEmail={settings?.email} />;
}

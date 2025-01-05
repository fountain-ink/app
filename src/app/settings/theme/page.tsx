import { ThemeSettings } from "@/components/settings/settings-theme";
import { getSettings } from "@/lib/settings/get-settings";

export const metadata = {
  title: "Theme Settings",
};

export default async function ThemeSettingsPage() {
  const settings = await getSettings();
  return <ThemeSettings initialSettings={settings} />;
}

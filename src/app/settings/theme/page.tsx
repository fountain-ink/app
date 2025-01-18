import { ThemeSettings } from "@/components/settings/settings-theme";
import { getMetadata } from "@/lib/settings/get-metadata";

export const metadata = {
  title: "Theme Settings",
};

export default async function ThemeSettingsPage() {
  const metadata = await getMetadata();
  return <ThemeSettings initialMetadata={metadata || {}} />;
}

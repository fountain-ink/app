import { BlogSettings } from "@/components/settings/settings-blog";
import { getSettings } from "@/lib/settings/get-settings";

export const metadata = {
  title: "Blog Settings",
};

export default async function BlogSettingsPage() {
  const settings = await getSettings();
  const initialSettings = 'metadata' in settings ? settings.metadata : {};
  return <BlogSettings initialSettings={initialSettings} />;
}

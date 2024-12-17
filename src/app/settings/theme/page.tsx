import { ThemeSettings } from "@/components/settings/settings-theme";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";

export const metadata = {
  title: "Theme Settings",
};

export default async function ProfileSettingsPage() {
  const { profile } = await getAuthWithCookies();
  return <ThemeSettings profile={profile} />;
}

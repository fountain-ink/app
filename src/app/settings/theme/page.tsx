import { ThemeSettings } from "@/components/settings/settings-theme";
import { getLensClientWithCookies } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";

export const metadata = {
  title: "Theme Settings",
};

export default async function ProfileSettingsPage() {
  const lens = await getLensClientWithCookies();
  const { profile } = await getUserProfile(lens);
  
  return <ThemeSettings profile={profile} />;
}

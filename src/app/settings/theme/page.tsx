import { ThemeSettings } from "@/components/settings/settings-theme";
import { createLensClient } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";

export const metadata = {
  title: "Theme Settings",
};

export default async function ProfileSettingsPage() {
  const lens = await createLensClient();
  const { profile } = await getUserProfile(lens);
  
  return <ThemeSettings profile={profile} />;
}

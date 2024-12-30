import { ProfileSettings } from "@/components/settings/settings-profile";
import { createLensClient } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";

export const metadata = {
  title: "Profile Settings",
};

export default async function ProfileSettingsPage() {
  const lens = await createLensClient();
  const { profile } = await getUserProfile(lens);

  return <ProfileSettings profile={profile} />;
}

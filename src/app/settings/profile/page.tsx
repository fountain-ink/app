import { ProfileSettingsCard } from "@/components/settings/settings-profile";
import { getUserProfile } from "@/lib/auth/get-user-profile";

export const metadata = {
  title: "Profile Settings",
};

export default async function ProfileSettingsPage() {
  const { profile } = await getUserProfile();

  return <ProfileSettingsCard profile={profile?.loggedInAs.account} />;
}

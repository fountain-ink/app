import { ProfileSettings } from "@/components/settings/settings-profile";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";

export const metadata = {
  title: "Profile Settings",
};

export default async function ProfileSettingsPage() {
  const lens = await getLensClient();
  const { profile } = await getUserProfile();
  console.log(profile);

  return <ProfileSettings profile={profile?.loggedInAs.account} />;
}

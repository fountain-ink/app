import { ProfileSettingsCard } from "@/components/settings/settings-profile";
import { getUserAccount } from "@/lib/auth/get-user-profile";

export const metadata = {
  title: "Profile Settings",
};

export default async function ProfileSettingsPage() {
  const { account: profile } = await getUserAccount();

  return <ProfileSettingsCard profile={profile?.loggedInAs.account} />;
}

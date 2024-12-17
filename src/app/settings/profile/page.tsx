import { ProfileSettings } from "@/components/settings/settings-profile";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";

export const metadata = {
  title: "Profile Settings",
};

export default async function ProfileSettingsPage() {
  const { profile } = await getAuthWithCookies();
  return <ProfileSettings profile={profile} />;
}

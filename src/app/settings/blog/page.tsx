import { BlogSettings } from "@/components/settings/settings-blog";
import { createLensClient } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";

export const metadata = {
  title: "Blog Settings",
};

export default async function BlogSettingsPage() {
  const lens = await createLensClient();
  const { profile } = await getUserProfile(lens);
  
  return <BlogSettings profile={profile} />;
}

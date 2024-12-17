import { BlogSettings } from "@/components/settings/settings-blog";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";

export const metadata = {
  title: "Blog Settings",
};

export default async function BlogSettingsPage() {
  const { profile } = await getAuthWithCookies();
  
  return <BlogSettings profile={profile} />;
}
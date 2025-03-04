import { BlogSettings } from "@/components/settings/settings-blog";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { BlogData, getBlogData } from "@/lib/settings/get-blog-metadata";
import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";

export const metadata = {
  title: "Blog Settings",
};

export default async function BlogSettingsPage() {
  const appToken = getAppToken();
  const claims = getTokenClaims(appToken);

  if (!claims) {
    return notFound();
  }

  const db = await createClient();
  const { data: blogSettings } = await db
    .from("blogs")
    .select()
    .eq("address", claims.sub)
    .single();

  return (
    <BlogSettings 
      isUserBlog={true} 
      userHandle={claims.metadata.username} 
      initialSettings={blogSettings as BlogData} 
    />
  );
}


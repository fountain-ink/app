import { BlogSettings } from "@/components/settings/settings-blog";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogSettings as BlogSettingsType } from "@/hooks/use-blog-settings";

interface PageProps {
  params: {
    address: string;
  };
}

export default async function BlogPage({ params }: PageProps) {
  const appToken = getAppToken();
  const claims = getTokenClaims(appToken);

  if (!claims) {
    return notFound();
  }

  const db = await createClient();
  const { data: blogSettings } = await db
    .from("blogs")
    .select()
    .eq("address", params.address)
    .single();
  
  if (!blogSettings) {
    return notFound();
  }

  const isUserBlog = blogSettings.owner === claims.metadata.address;

  const initialSettings: BlogSettingsType = {
    ...blogSettings,
    title: blogSettings.title || "",
    about: blogSettings.about || "",
    metadata: {
      showAuthor: (blogSettings.metadata as any)?.showAuthor ?? true,
      showTags: (blogSettings.metadata as any)?.showTags ?? true,
      showTitle: (blogSettings.metadata as any)?.showTitle ?? true,
    },
  };

  return (
    <BlogSettings
      blogAddress={params.address}
      initialSettings={initialSettings}
      isUserBlog={isUserBlog}
    />);
} 
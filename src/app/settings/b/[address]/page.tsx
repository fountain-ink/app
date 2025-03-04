import { BlogSettings } from "@/components/settings/settings-blog";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogData } from "@/lib/settings/get-blog-metadata";

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

  return (
    <BlogSettings
      initialSettings={blogSettings as BlogData}
      isUserBlog={isUserBlog}
    />);
} 
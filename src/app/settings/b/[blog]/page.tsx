import { BlogSettings } from "@/components/settings/settings-blog";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { BlogData } from "@/lib/settings/get-blog-data";

interface PageProps {
  params: {
    blog: string;
  };
}

export default async function BlogPage({ params }: PageProps) {
  const appToken = getAppToken();
  const claims = getTokenClaims(appToken);

  if (!claims) {
    return notFound();
  }

  const db = await createClient();
  const { data: blog } = await db.from("blogs").select().eq("address", params.blog).single();

  if (!blog) {
    return notFound();
  }

  const isUserBlog = blog.address === claims.metadata.address;

  return (
    <BlogSettings 
      initialSettings={blog as BlogData}
      userHandle={claims.metadata.username}
      isUserBlog={isUserBlog}
    />
  );
}

import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { fetchAccount } from "@lens-protocol/client/actions";
import { getLensClient } from "@/lib/lens/client";
import UserBlogPage from "../page";

interface PageProps {
  params: {
    blog: string;
    slug: string;
  };
}

export default async function BlogHandlePage({ params }: PageProps) {
  const { blog, slug } = params;

  const blogAddress = await resolveBlog(blog, slug);

  if (!blogAddress) {
    return notFound();
  }

  return <UserBlogPage params={{ blog: blogAddress }} />;
}

async function resolveBlog(username: string, slug: string): Promise<string | null> {
  try {
    const db = await createClient();
    const { data: blog } = await db.from("blogs").select("address").eq("handle", username).eq("slug", slug).single();

    return blog?.address || null;
  } catch (error) {
    console.error("Error resolving blog:", error);
    return null;
  }
}

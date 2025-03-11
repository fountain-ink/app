import { notFound, redirect } from "next/navigation";
import { UserBlogPage } from "../page";
import { createClient } from "@/lib/supabase/server";
import { fetchAccount } from "@lens-protocol/client/actions";
import { getLensClient } from "@/lib/lens/client";

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

  redirect(`/b/${blogAddress}`);
}

export async function resolveBlog(username: string, slug?: string): Promise<string | null> {
  try {
    const lens = await getLensClient();
    const profile = await fetchAccount(lens, { username: { localName: username } }).unwrapOr(null);

    if (!profile) {
      return null;
    }

    if (!slug) {
      return profile.address;
    }

    const db = await createClient();
    const { data: blog } = await db
      .from("blogs")
      .select("address")
      .eq("owner", profile.address)
      .eq("slug", slug)
      .single();

    return blog?.address || null;
  } catch (error) {
    console.error("Error resolving blog:", error);
    return null;
  }
}

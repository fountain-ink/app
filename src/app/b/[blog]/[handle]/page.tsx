import { notFound, redirect } from "next/navigation";
import { UserBlogPage } from "../page";
import { createClient } from "@/lib/supabase/server";
import { fetchAccount } from "@lens-protocol/client/actions";
import { getLensClient } from "@/lib/lens/client";

interface PageProps {
  params: {
    blog: string;
    handle: string;
  };
}

export default async function BlogHandlePage({ params }: PageProps) {
  const { blog, handle } = params;
  
  const blogAddress = await resolveBlogHandle(blog, handle);
  
  if (!blogAddress) {
    return notFound();
  }
  
  redirect(`/b/${blogAddress}`);
} 

export async function resolveBlogHandle(username: string, handle?: string): Promise<string | null> {
  try {
    const lens = await getLensClient();
    const profile = await fetchAccount(lens, { username: { localName: username } }).unwrapOr(null);
    
    if (!profile) {
      return null;
    }
    
    if (!handle) {
      return profile.address;
    }
    
    const db = await createClient();
    const { data: blog } = await db
      .from("blogs")
      .select("address")
      .eq("owner", profile.address)
      .eq("handle", handle)
      .single();
    
    return blog?.address || null;
  } catch (error) {
    console.error("Error resolving blog handle:", error);
    return null;
  }
} 
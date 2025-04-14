import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import BlogPage from "../page";

export default async function BlogHandlePage({ params }: { params: { blog: string; slug: string } }) {
  const { blog, slug } = params;

  const blogAddress = await resolveBlog(blog, slug);

  if (!blogAddress) {
    return notFound();
  }

  return <BlogPage params={{ blog: blogAddress }} />;
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

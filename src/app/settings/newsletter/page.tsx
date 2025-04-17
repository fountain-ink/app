import { cookies } from "next/headers";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { createClient } from "@/lib/db/server";
import { NewsletterSettings } from "@/components/settings/settings-newsletter";
import { getListById } from "@/lib/listmonk/client";
import { Json } from "@/lib/db/database";
import { BlogData, BlogThemeData, BlogMetadata } from "@/lib/settings/get-blog-data";

export type BlogDataWithSubscriberCount = BlogData & {
  subscriber_count: number;
};

async function getBlogsWithSubscribers(): Promise<BlogDataWithSubscriberCount[]> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("appToken")?.value;
    if (!token) return [];

    const claims = getTokenClaims(token);
    if (!claims?.metadata?.address) return [];

    const userAddress = claims.metadata.address;

    const db = await createClient();
    const { data: userBlogs, error } = await db
      .from("blogs")
      .select("*")
      .eq("owner", userAddress)
      .order("created_at", { ascending: true });

    if (error) {
      console.error("Error fetching user blogs:", error);
      return [];
    }

    const blogsWithSubscriberCounts = await Promise.all(
      (userBlogs || []).map(async (blog) => {
        const blogWithTypedProps = {
          ...blog,
          theme: blog.theme as BlogThemeData | null,
          metadata: blog.metadata as BlogMetadata | null,
        };

        if (blog.mail_list_id) {
          try {
            const list = await getListById(blog.mail_list_id);
            return {
              ...blogWithTypedProps,
              subscriber_count: list?.subscriber_count || 0,
            };
          } catch (error) {
            console.error(`Error fetching subscriber count for blog ${blog.address}:`, error);
            return {
              ...blogWithTypedProps,
              subscriber_count: 0,
            };
          }
        }
        return {
          ...blogWithTypedProps,
          subscriber_count: 0,
        };
      }),
    );

    return blogsWithSubscriberCounts || [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export default async function NewsletterSettingsPage() {
  const blogs = await getBlogsWithSubscribers();

  return <NewsletterSettings blogs={blogs} />;
}

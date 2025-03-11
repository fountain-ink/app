import { cookies } from "next/headers";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { createClient } from "@/lib/supabase/server";
import { NewsletterSettings } from "@/components/settings/settings-newsletter";
import { getListById } from "@/lib/listmonk/client";

interface BlogNewsletterData {
  address: string;
  title: string;
  about?: string;
  icon?: string;
  handle?: string;
  mail_list_id?: number | null;
  owner: string;
  subscriber_count?: number;
}

async function getBlogs() {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get("appToken")?.value;
    if (!token) return [];

    const claims = getTokenClaims(token);
    if (!claims?.metadata?.address) return [];

    const userAddress = claims.metadata.address;

    const db = await createClient();
    const { data: userBlogs, error } = await db.from("blogs").select("*").eq("owner", userAddress);

    if (error) {
      console.error("Error fetching user blogs:", error);
      return [];
    }

    // Fetch subscriber counts for blogs with mail_list_id
    const blogsWithSubscriberCounts = await Promise.all(
      (userBlogs || []).map(async (blog) => {
        if (blog.mail_list_id) {
          try {
            const list = await getListById(blog.mail_list_id);
            return {
              ...blog,
              subscriber_count: list?.subscriber_count || 0,
            };
          } catch (error) {
            console.error(`Error fetching subscriber count for blog ${blog.address}:`, error);
            return blog;
          }
        }
        return blog;
      }),
    );

    return blogsWithSubscriberCounts || [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export default async function NewsletterSettingsPage() {
  const blogs = await getBlogs();

  return <NewsletterSettings blogs={blogs} />;
}

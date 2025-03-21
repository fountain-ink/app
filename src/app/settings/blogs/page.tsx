import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BlogCard } from "@/components/blog/blog-card";
import { cookies } from "next/headers";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { createClient } from "@/lib/supabase/server";
import { SyncButton } from "@/components/blog/blog-sync-button";
import { CreateBlogButton } from "@/components/blog/blog-create-modal";

interface BlogSettings {
  address: string;
  title: string;
  about?: string;
  icon?: string | null;
  handle?: string | null;
  owner: string;
  slug?: string | null;
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

    return userBlogs || [];
  } catch (error) {
    console.error("Error fetching blogs:", error);
    return [];
  }
}

export default async function BlogsSettingsPage() {
  const blogs = await getBlogs();

  const personalBlog = blogs.find((blog) => blog.owner === blog.address);
  const otherBlogs = blogs.filter((blog) => blog.owner !== blog.address);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Blogs</CardTitle>
          <CardDescription>Manage your blogs and create new ones.</CardDescription>
        </div>
        <div className="flex space-x-2">
          <SyncButton />
          <CreateBlogButton />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {personalBlog && (
            <BlogCard
              blog={{
                title: personalBlog.title || "Personal Blog",
                description: personalBlog.about || "Your personal blog settings",
                address: personalBlog.address,
                icon: personalBlog.icon,
                handle: personalBlog.handle || undefined,
                isUserBlog: true,
                slug: personalBlog.slug || undefined
              }}
              href={`/settings/b/${personalBlog.address}`}
              showExternalLink={true}
            />
          )}

          {!otherBlogs.length ? (
            <p className="text-sm text-muted-foreground">No additional blogs created yet.</p>
          ) : (
            otherBlogs.map((blog) => (
              <BlogCard
                key={blog.address}
                blog={{
                  title: blog.title || "Untitled Blog",
                  description: blog.about || undefined,
                  address: blog.address,
                  icon: blog.icon,
                  handle: blog.handle || undefined,
                  slug: blog.slug || undefined
                }}
                href={`/settings/b/${blog.address}`}
                showExternalLink={true}
              />
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

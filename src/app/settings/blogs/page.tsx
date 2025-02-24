"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { getLensClient } from "@/lib/lens/client";
import { CreateBlogModal } from "@/components/blog/create-blog-modal";
import { fetchGroups } from "@lens-protocol/client/actions";
import { Group } from "@lens-protocol/client";
import { evmAddress } from "@lens-protocol/client";
import { Skeleton } from "@/components/ui/skeleton";
import { BlogSettings } from "@/hooks/use-blog-settings";
import { BlogCard } from "@/components/blog/blog-card";

interface PageInfo {
  prev: string | null;
  next: string | null;
}

export default function BlogsSettingsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [blogs, setBlogs] = useState<(Group & { db?: BlogSettings })[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ prev: null, next: null });
  const [isLoading, setIsLoading] = useState(true);
  const [personalBlog, setPersonalBlog] = useState<BlogSettings & { userAddress?: string } | null>(null);

  const fetchPersonalBlog = async () => {
    try {
      const response = await fetch('/api/blog/personal');
      if (!response.ok) {
        throw new Error('Failed to fetch personal blog');
      }
      const data = await response.json();
      setPersonalBlog(data);
    } catch (error) {
      console.error("Error fetching personal blog:", error);
    }
  };

  const fetchBlogSettings = async (addresses: string[]) => {
    try {
      const response = await fetch('/api/blogs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ addresses }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch blog settings');
      }
      
      const { blogs: dbBlogs } = await response.json();
      return dbBlogs as BlogSettings[];
    } catch (error) {
      console.error("Error fetching blog settings:", error);
      return [] as BlogSettings[];
    }
  };

  const fetchUserBlogs = async (cursor?: string) => {
    const client = await getLensClient();
    if (!client.isSessionClient()) return;
    const user = await client.getAuthenticatedUser();
    if (user.isErr()) return;

    try {
      setIsLoading(true);
      const result = await fetchGroups(client, {
        filter: {
          member: evmAddress(user.value.address),
        },
        ...(cursor ? { cursor } : {}),
      });

      if (result.isErr()) {
        console.error("Failed to fetch blogs:", result.error);
        return;
      }

      const { items, pageInfo: newPageInfo } = result.value;
      
      // Fetch database settings for all blogs
      const dbSettings = await fetchBlogSettings(items.map(item => item.address));
      
      // Merge on-chain data with database settings
      const mergedBlogs = items.map(item => ({
        ...item,
        db: dbSettings.find(db => db.address === item.address),
      }));

      setBlogs(currentBlogs => 
        cursor 
          ? [...currentBlogs, ...mergedBlogs] 
          : mergedBlogs
      );
      
      setPageInfo({
        prev: newPageInfo.prev,
        next: newPageInfo.next,
      });
    } catch (error) {
      console.error("Error fetching blogs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPersonalBlog();
    fetchUserBlogs();
  }, []);

  const handleCreateSuccess = () => {
    fetchUserBlogs();
  };

  const handleLoadMore = () => {
    if (pageInfo.next) {
      fetchUserBlogs(pageInfo.next);
    }
  };

  const renderBlogsList = () => {
    if (isLoading && !blogs.length) {
      return (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <BlogCard
          title={personalBlog?.title || "Personal Blog"}
          description={personalBlog?.about || "Your personal blog settings"}
          address={personalBlog?.userAddress}
          href="/settings/blog"
          isUserBlog
          icon={personalBlog?.icon}
        />

        {!blogs.length ? (
          <p className="text-sm text-muted-foreground">No additional blogs created yet.</p>
        ) : (
          blogs.map((blog) => (
            <BlogCard
              key={blog.address}
              title={blog.db?.title || blog.metadata?.name || "Untitled Blog"}
              description={blog.db?.about || blog.metadata?.description || undefined}
              address={blog.address}
              href={`/settings/blog/${blog.address}`}
              icon={blog.db?.icon || blog.metadata?.icon}
            />
          ))
        )}
        
        {pageInfo.next && (
          <div className="flex justify-center pt-4">
            <Button
              variant="outline"
              onClick={handleLoadMore}
              disabled={isLoading}
            >
              {isLoading ? "Loading..." : "Load More"}
            </Button>
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Blogs</CardTitle>
            <CardDescription>Manage your blogs and create new ones.</CardDescription>
          </div>
          <Button onClick={() => setIsCreateModalOpen(true)} className="ml-4">
            <Plus className="w-4 h-4 mr-2" />
            Create Blog
          </Button>
        </CardHeader>
        <CardContent>
          {renderBlogsList()}
        </CardContent>
      </Card>

      <CreateBlogModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        onSuccess={handleCreateSuccess}
      />
    </>
  );
} 
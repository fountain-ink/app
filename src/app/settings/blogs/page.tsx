"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { getLensClient } from "@/lib/lens/client";
import { CreateBlogModal } from "@/components/blog/create-blog-modal";
import { fetchGroups } from "@lens-protocol/client/actions";
import { Group } from "@lens-protocol/client";
import { useAccount } from "wagmi";
import { evmAddress } from "@lens-protocol/client";
import { Skeleton } from "@/components/ui/skeleton";
import { EvmAddressDisplay } from "@/components/ui/metadata-display";
import { getUserProfile } from "@/lib/auth/get-user-profile";

interface PageInfo {
  prev: string | null;
  next: string | null;
}

export default function BlogsSettingsPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [blogs, setBlogs] = useState<Group[]>([]);
  const [pageInfo, setPageInfo] = useState<PageInfo>({ prev: null, next: null });
  const [isLoading, setIsLoading] = useState(true);

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
      
      setBlogs(currentBlogs => cursor ? [...currentBlogs, ...items].map(item => ({ ...item })) : items.map(item => ({ ...item })));
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

    if (!blogs.length) {
      return <p className="text-sm text-muted-foreground">No blogs created yet.</p>;
    }

    return (
      <div className="space-y-4">
        {blogs.map((blog) => (
          <div
            key={blog.address}
            className="p-4 rounded-lg border border-border hover:bg-accent transition-colors"
          >
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{blog.metadata?.name || "Untitled Blog"}</h3>
                  <p className="text-sm text-muted-foreground">
                    {blog.metadata?.description || "No description"}
                  </p>
                </div>
                <Button variant="ghost" size="sm">
                  Manage
                </Button>
              </div>
              <EvmAddressDisplay address={blog.address} />
              {/* {blog.feed && (
                <EvmAddressDisplay address={blog.feed} />
              )} */}
            </div>
          </div>
        ))}
        
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
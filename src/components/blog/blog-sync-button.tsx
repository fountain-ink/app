"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useBlogStorage } from "@/hooks/use-blog-storage";

export async function syncBlogsQuietly() {
  try {
    const response = await fetch("/api/blogs/sync");

    if (!response.ok) {
      console.error("Failed to sync blogs");
      return false;
    }

    const blogsResponse = await fetch("/api/blogs");
    if (blogsResponse.ok) {
      const data = await blogsResponse.json();
      console.log("Blogs synced successfully");
      return data.blogs;
    }
    return false;
  } catch (error) {
    console.error("Error syncing blogs:", error);
    return false;
  }
}

export function SyncButton() {
  const [isSyncing, setIsSyncing] = useState(false);
  const router = useRouter();
  const { setBlogs } = useBlogStorage();

  const handleSync = async () => {
    try {
      setIsSyncing(true);

      const response = await fetch("/api/blogs/sync");

      if (!response.ok) {
        throw new Error("Failed to sync blogs");
      }

      const blogsResponse = await fetch("/api/blogs");
      if (blogsResponse.ok) {
        const data = await blogsResponse.json();
        setBlogs(data.blogs);
        console.log("Blogs synced successfully");
      }

      router.refresh();
      toast.success("Blogs synced successfully");
    } catch (error) {
      console.error("Error syncing blogs:", error);
      toast.error("Failed to sync blogs");
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline" size="icon" className="bg-transparent" onClick={handleSync} disabled={isSyncing}>
            <motion.div
              animate={isSyncing ? { rotate: 360 } : { rotate: 0 }}
              transition={
                isSyncing
                  ? { repeat: Number.POSITIVE_INFINITY, duration: 1, ease: "anticipate", repeatType: "loop" }
                  : { type: "easeInOut", stiffness: 200, damping: 10 }
              }
            >
              <RefreshCw className="h-3 w-3" />
            </motion.div>
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Sync on-chain data with Fountain</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

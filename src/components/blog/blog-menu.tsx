"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal
} from "@/components/ui/dropdown-menu";
import { PenToolIcon } from "../icons/pen-tool";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { ChevronRightIcon, PenTool } from "lucide-react";
import { useRouter } from "next/navigation";
import { BlogSettings } from "@/hooks/use-blog-settings";

interface BlogMenuProps {
  username: string;
}

export function BlogMenu({ username }: BlogMenuProps) {
  const [blogs, setBlogs] = useState<BlogSettings[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/blogs');
        if (!response.ok) throw new Error('Failed to fetch blogs');

        const data = await response.json();

        setBlogs(data.blogs);
      } catch (error) {
        console.error('Error fetching blogs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogs();
  }, [username]);

  const navigateToBlog = (blog: BlogSettings) => {
    if (blog.address === blog.owner) {
      router.push(`/b/${username}`);
    } else if (blog.handle) {
      router.push(`/blog/${blog.handle}`);
    } else if (blog.address) {
      router.push(`/blog/${blog.address}`);
    }
  };

  const shouldShowDropdown = () => {
    if (blogs.length === 0) return false;
    if (blogs.length === 1 && blogs[0] && blogs[0].address === blogs[0].owner) return false;
    
    return true;
  };

  const handleClick = () => {
    if (!shouldShowDropdown()) {
      router.push(`/b/${username}`);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger onClick={handleClick} disabled={!shouldShowDropdown()}>
        <AnimatedMenuItem href={!shouldShowDropdown() ? `/b/${username}` : undefined} icon={PenToolIcon}>
          <div className="flex justify-between items-center text-base w-[134px]">
            Blog
            {shouldShowDropdown() && <ChevronRightIcon className="ml-auto h-4 w-4" />}
          </div>
        </AnimatedMenuItem>
      </DropdownMenuTrigger>
      {shouldShowDropdown() && (
        <DropdownMenuPortal>
          <DropdownMenuContent className="w-48" side="left" align="start">
            {blogs.map((blog) => (
              <DropdownMenuItem
                key={blog.address}
                onClick={() => navigateToBlog(blog)}
                className="flex justify-start gap-2 m-0 p-2 py-3 items-center text-base "
              >
                <div className="w-5 h-5 rounded-[4px] overflow-hidden relative flex-shrink-0 aspect-square">
                  {blog.icon ? (
                    <img src={blog.icon} className="w-full h-full object-cover absolute inset-0" alt={`${blog.handle || blog.address.substring(0, 6)} icon`} />
                  ) : (
                    <div className="placeholder-background absolute inset-0" />
                  )}
                </div>
                <span>/{blog.handle || blog.address.substring(0, 6)}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      )}
    </DropdownMenu>
  );
} 
"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuPortal,
} from "@/components/ui/dropdown-menu";
import { PenToolIcon as CustomPenToolIcon } from "../icons/pen-tool";
import { AnimatedMenuItem } from "../navigation/animated-item";
import { ChevronRightIcon, PenToolIcon } from "lucide-react";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import Link from "next/link";
import { BlogData } from "@/lib/settings/get-blog-data";
import Image from "next/image";

interface BlogMenuProps {
  username: string;
}

export function BlogMenu({ username }: BlogMenuProps) {
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, boolean>>({});
  const { getBlogs } = useBlogStorage();

  useEffect(() => {
    setIsLoading(true);
    getBlogs()
      .then((fetchedBlogs) => {
        setBlogs(fetchedBlogs || []);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Error fetching blogs:", error);
        setIsLoading(false);
      });
  }, [getBlogs]);

  const getBlogUrl = (blog: BlogData): string => {
    if (blog.address === blog.owner) {
      return `/b/${username}`;
    } else {
      return `/b/${blog.address}`;
    }
  };

  const shouldShowDropdown = () => {
    if (blogs.length === 0) return false;
    if (blogs.length === 1 && blogs[0] && blogs[0].address === blogs[0].owner) return false;

    return true;
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={!shouldShowDropdown() || isLoading}>
        <AnimatedMenuItem href={!shouldShowDropdown() ? `/b/${username}` : undefined} icon={CustomPenToolIcon}>
          <div className="flex justify-between items-center text-base w-[134px]">
            Blog
            {shouldShowDropdown() && <ChevronRightIcon className="ml-auto h-4 w-4" />}
          </div>
        </AnimatedMenuItem>
      </DropdownMenuTrigger>
      {shouldShowDropdown() && (
        <DropdownMenuPortal>
          <DropdownMenuContent className="w-fit min-w-48 py-1" side="left" align="start">
            {blogs.map((blog) => (
              <Link href={getBlogUrl(blog)} key={blog.address} passHref>
                <DropdownMenuItem className="flex justify-start h-8 gap-2 p-1 items-center text-base">
                  <div className="rounded-sm h-full overflow-hidden relative flex-shrink-0 aspect-square">
                    {blog.icon && imageLoadStatus[blog.address] !== false ? (
                      <Image
                        src={blog.icon}
                        className="w-full h-full object-cover absolute inset-0"
                        alt={`${blog.handle || blog.address.substring(0, 6)} icon`}
                        width={64}
                        height={64}
                        onLoad={(e) => {
                          const img = e.target as HTMLImageElement;
                          if (img.naturalWidth === 0) {
                            setImageLoadStatus((prev) => ({
                              ...prev,
                              [blog.address]: false,
                            }));
                          }
                        }}
                        onError={() => {
                          setImageLoadStatus((prev) => ({
                            ...prev,
                            [blog.address]: false,
                          }));
                        }}
                      />
                    ) : (
                      <div className="flex items-center justify-center w-full h-full absolute inset-0">
                        <PenToolIcon className="h-4 w-4" />
                      </div>
                    )}
                  </div>
                  <span>
                    {blog.handle || blog.address.substring(0, 9)}
                    {blog.address === blog.owner && " (Personal)"}
                  </span>
                </DropdownMenuItem>
              </Link>
            ))}
          </DropdownMenuContent>
        </DropdownMenuPortal>
      )}
    </DropdownMenu>
  );
}

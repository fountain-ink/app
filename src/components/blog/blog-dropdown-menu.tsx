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
import { ChevronRightIcon, PenToolIcon, User2Icon, UserIcon } from "lucide-react";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import Link from "next/link";
import { BlogData } from "@/lib/settings/get-blog-data";
import Image from "next/image";

interface BlogMenuProps {
  username: string;
}

export function BlogDropdownMenu({ username }: BlogMenuProps) {
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, boolean>>({});
  const { getBlogs, blogState } = useBlogStorage();
  const { blogs } = blogState;
  const hasMultipleBlogs = blogs.length > 1 || (blogs.length === 1 && blogs[0]?.address !== blogs[0]?.owner);
  const isLoading = blogState.isFetching;

  useEffect(() => {
    getBlogs().catch((error) => {
      console.error("Error fetching blogs:", error);
    });
  }, [getBlogs]);

  const getBlogUrl = (blog: BlogData): string => {
    if (blog.address === blog.owner) {
      return `/b/${username}`;
    }
    if (blog.slug && blog.slug !== "" && blog.handle && blog.handle !== "") {
      return `/b/${blog.handle}/${blog.slug}`;
    }
    return `/b/${blog.address}`;
  };

  if (!hasMultipleBlogs) {
    return (
      <AnimatedMenuItem href={`/b/${username}`} icon={CustomPenToolIcon}>
        <div className="flex items-center text-base w-[134px]">Blog</div>
      </AnimatedMenuItem>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isLoading}>
        <AnimatedMenuItem icon={CustomPenToolIcon}>
          <div className="flex justify-between items-center text-base w-[134px]">
            Blogs
            <ChevronRightIcon className="ml-auto h-4 w-4" />
          </div>
        </AnimatedMenuItem>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent className="w-fit min-w-48 -mt-1 mr-1" side="left" align="start">
          {blogs.map((blog) => (
            <Link href={getBlogUrl(blog)} key={blog.address} passHref>
              <DropdownMenuItem className="flex justify-start h-8 gap-2 p-1 mx-0 w-full items-center text-base">
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
                <span className="truncate flex items-center gap-2 max-w-[300px]">
                  {blog.handle || blog.title || blog.address.substring(0, 9)}
                  {blog.address === blog.owner && <User2Icon className="w-4 h-4" />}
                </span>
              </DropdownMenuItem>
            </Link>
          ))}
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
}

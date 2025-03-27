"use client";

import { useEffect, useState, memo } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { BlogData } from "@/lib/settings/get-blog-data";
import { MailIcon, PenToolIcon } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface BlogSelectMenuProps {
  onBlogChange?: (value: string) => void;
  selectedBlogAddress?: string | null;
  placeholder?: string;
  includePersonalBlog?: boolean;
  className?: string;
}

function BlogSelectMenuComponent({
  onBlogChange,
  selectedBlogAddress,
  placeholder = "Select a blog",
  includePersonalBlog = true,
  className,
}: BlogSelectMenuProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [imageLoadStatus, setImageLoadStatus] = useState<Record<string, boolean>>({});
  const { blogState, getBlogs } = useBlogStorage();

  useEffect(() => {
    const fetchBlogsOnce = async () => {
      setIsLoading(true);
      try {
        const fetchedBlogs = await getBlogs();

        if (!selectedBlogAddress && fetchedBlogs && fetchedBlogs.length > 0) {
          const personalBlog = fetchedBlogs.find(blog => blog.address === blog.owner);
          if (personalBlog && onBlogChange) {
            onBlogChange(personalBlog.address);
          }
        }

      } catch (error) {
        console.error("Error fetching blogs:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchBlogsOnce();

  }, []);

  const filteredBlogs = includePersonalBlog
    ? blogState.blogs
    : blogState.blogs.filter(blog => !(blog.address === blog.owner));

  const handleBlogChange = (value: string) => {
    if (onBlogChange) {
      onBlogChange(value);
    }
  };

  const noBlogsAvailable = filteredBlogs.length === 0 ||
    (!includePersonalBlog && filteredBlogs.length === 1 && filteredBlogs[0]?.address === filteredBlogs[0]?.owner);

  return (
    <Select value={selectedBlogAddress || undefined} onValueChange={handleBlogChange} disabled={isLoading || noBlogsAvailable}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent position="popper" sideOffset={5} className="z-[60]" side="bottom">
        {filteredBlogs.length > 0 ? (
          filteredBlogs.map((blog) => (
            <SelectItem key={blog.address} value={blog.address} className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="rounded-sm h-6 w-6 overflow-hidden relative flex-shrink-0 aspect-square">
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
                <span className="flex items-center gap-1">
                  {blog.handle || blog.title || blog.address.substring(0, 9)}
                  {blog.address === blog.owner && " (Personal Blog)"}
                  {blog.mail_list_id && <MailIcon className="h-3.5 w-3.5 ml-1 opacity-70" />}
                </span>
              </div>
            </SelectItem>
          ))
        ) : (
          <div className="py-2 px-2 text-sm text-muted-foreground">No blogs found</div>
        )}
      </SelectContent>
    </Select>
  );
}

export const BlogSelectMenu = memo(BlogSelectMenuComponent); 
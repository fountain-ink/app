"use client";

import { BlogCard } from "@/components/blog/blog-card";
import { BlogData } from "@/lib/settings/get-blogs-by-owner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { cn } from "@/lib/utils";

interface UserBlogsListProps {
  blogs: BlogData[];
}

export function UserBlogsList({ blogs }: UserBlogsListProps) {
  if (!blogs || blogs.length === 0) {
    return null;
  }

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScrollability = () => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      setCanScrollLeft(scrollContainer.scrollLeft > 1);

      const hasMoreContentRight =
        Math.ceil(scrollContainer.scrollLeft + scrollContainer.clientWidth) < scrollContainer.scrollWidth - 1;

      setCanScrollRight(hasMoreContentRight);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      checkScrollability();

      scrollContainer.addEventListener("scroll", checkScrollability);
      window.addEventListener("resize", checkScrollability);

      const timeoutId = setTimeout(checkScrollability, 500);

      return () => {
        scrollContainer.removeEventListener("scroll", checkScrollability);
        window.removeEventListener("resize", checkScrollability);
        clearTimeout(timeoutId);
      };
    }
  }, []);

  const scroll = (direction: "left" | "right") => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      const scrollAmount = 300;
      const targetScroll = scrollContainer.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      scrollContainer.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none transition-opacity duration-200",
          !canScrollLeft && "opacity-0",
        )}
      />

      <div
        className={cn(
          "absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none transition-opacity duration-200",
          !canScrollRight && "opacity-0",
        )}
      />

      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute -left-[50px] top-1/2 transform -translate-y-1/2 rounded-full z-20 opacity-80 hover:opacity-100 transition-opacity shadow-sm",
          !canScrollLeft && "opacity-0 pointer-events-none",
        )}
        onClick={() => scroll("left")}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>

      <Button
        variant="outline"
        size="icon"
        className={cn(
          "absolute -right-[50px] top-1/2 transform -translate-y-1/2 rounded-full z-20 opacity-80 hover:opacity-100 transition-opacity shadow-sm",
          !canScrollRight && "opacity-0 pointer-events-none",
        )}
        onClick={() => scroll("right")}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>

      <div className="relative overflow-hidden">
        <div ref={scrollContainerRef} className="flex space-x-4 p-4 pb-0 overflow-x-auto scrollbar-hide">
          {blogs.map((blog) => (
            <div key={blog.address} className="w-[250px] flex-shrink-0">
              <BlogCard
                blog={{
                  title: blog.title || "Untitled Blog",
                  description: blog.about || undefined,
                  address: blog.address,
                  icon: blog.icon,
                  handle: blog.handle || undefined,
                  slug: blog.slug || undefined,
                  isUserBlog: blog.owner === blog.address,
                }}
                showExternalLink={false}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

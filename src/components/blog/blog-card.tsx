"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLinkIcon, PenToolIcon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { useState } from "react";
import { resolveImageUrl } from "@/lib/utils/resolve-image-url";

interface Blog {
  title: string;
  description?: string;
  address: string;
  isUserBlog?: boolean;
  icon?: string | null;
  handle?: string;
  slug?: string;
  owner?: string;
}

interface BlogCardProps {
  blog: Blog;
  href?: string;
  showExternalLink?: boolean;
}

export function BlogCard({ blog, href, showExternalLink = true }: BlogCardProps) {
  const [imageLoaded, setImageLoaded] = useState(true);
  const { title, description, address, isUserBlog, icon, handle, slug } = blog;

  const blogUrl = isUserBlog ? `/b/${handle}` : handle && slug ? `/b/${handle}/${slug}` : `/b/${address}`;

  const linkHref = href || blogUrl;

  const iconUrl = resolveImageUrl(icon || undefined);

  return (
    <Card className="transition-all hover:bg-accent/50 relative">
      <Link prefetch href={linkHref} className="block">
        <CardHeader className="flex flex-row items-center p-4 gap-4 space-y-0">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-muted">
            {iconUrl && imageLoaded ? (
              <Image
                src={iconUrl}
                alt={title}
                className="rounded-sm object-cover"
                width={64}
                height={64}
                onLoadingComplete={(result) => {
                  if (result.naturalWidth === 0) {
                    setImageLoaded(false);
                  }
                }}
                onError={() => {
                  setImageLoaded(false);
                }}
              />
            ) : (
              <PenToolIcon className="h-5 w-5" />
            )}
          </div>
          <div className="space-y-1">
            <CardTitle className="text-base line-clamp-1">{title}</CardTitle>
            {description && <CardDescription className="line-clamp-1">{description}</CardDescription>}
          </div>
        </CardHeader>
      </Link>

      {showExternalLink && (
        <div className="absolute top-3 right-3">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link prefetch href={blogUrl} target="_blank" className="block">
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ExternalLinkIcon className="h-4 w-4" />
                    <span className="sr-only">Open blog in new tab</span>
                  </Button>
                </Link>
              </TooltipTrigger>
              <TooltipContent>
                <p>Open blog in new tab</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}
    </Card>
  );
}

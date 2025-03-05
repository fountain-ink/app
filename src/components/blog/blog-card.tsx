"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLinkIcon, PenIcon, PenToolIcon, User, User2Icon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Image from "next/image";
import { BookOpenIcon } from "lucide-react";
import { useState } from "react";

interface BlogCardProps {
  title: string;
  description?: string;
  address?: string;
  isUserBlog?: boolean;
  href: string;
  icon?: string | null;
  handle?: string;
}

export function BlogCard({ title, description, address, isUserBlog, href, icon, handle }: BlogCardProps) {
  const [imageLoaded, setImageLoaded] = useState(true);

  return (
    <Link href={href} className="block">
      <Card className="h-full transition-all hover:bg-accent/50">
        <CardHeader className="flex flex-row items-center p-4 gap-4 space-y-0">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-sm bg-muted">
            {icon && imageLoaded ? (
              <Image
                src={icon}
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
            <CardTitle className="text-base">{title}</CardTitle>
            {description && (
              <CardDescription className="line-clamp-1">
                {description}
              </CardDescription>
            )}
          </div>
        </CardHeader>
      </Card>
    </Link>
  );
} 
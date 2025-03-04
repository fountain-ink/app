"use client";

import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ExternalLinkIcon, User, User2Icon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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
  return (
    <Link href={href} className="block">
      <div
        className="flex p-4 items-stretch rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer"
      >
        <div className="w-24 h-24 rounded-md overflow-hidden relative shrink-0">
          {icon ? (
            <img
              src={icon}
              alt={`${title} icon`}
              className="w-full h-full"
            />
          ) : (
            <div className="w-full h-full flex relative items-center justify-center">
              <div className="placeholder-background" />
            </div>
          )}
        </div>

        <div className="flex-1 pl-4">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {isUserBlog && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <User2Icon className="h-4 w-4" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Your personal blog page</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                <h3 className="font-medium text-lg">{title}</h3>
                {isUserBlog && (
                  <Link href={`/b/${handle}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant={"ghostText"}
                      size="sm"
                      className="transition-colors flex items-center gap-1 h-auto py-0"
                    >
                      <span className="text-sm">/b/{handle}</span>
                      <ExternalLinkIcon className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
                {!isUserBlog && (
                  <Link href={`/b/${address}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant={"ghostText"}
                      size="sm"
                      className="transition-colors flex items-center gap-1 h-auto py-0"
                    >
                      <span className="text-sm">/b/{address?.substring(0, 4)}...{address?.substring(address.length - 3)}</span>
                      <ExternalLinkIcon className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              {description || "No description"}
            </p>
            {/* {address && <EvmAddressDisplay address={address} />} */}
          </div>
        </div>
      </div>
    </Link>
  )
} 
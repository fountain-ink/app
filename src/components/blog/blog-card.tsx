import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EvmAddressDisplay } from "@/components/ui/metadata-display";

interface BlogCardProps {
  title: string;
  description?: string;
  address?: string;
  isUserBlog?: boolean;
  href: string;
}

export function BlogCard({ title, description, address, isUserBlog, href }: BlogCardProps) {
  return (
    <div className="p-4 rounded-lg border border-border hover:bg-accent transition-colors">
      <div className="flex flex-col space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-medium">{title}</h3>
              {isUserBlog && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <User className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your personal blog page</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {description || "No description"}
            </p>
          </div>
          <Link href={href}>
            <Button variant="ghost" size="sm">
              Manage
            </Button>
          </Link>
        </div>
        {address && <EvmAddressDisplay address={address} />}
      </div>
    </div>
  )
} 
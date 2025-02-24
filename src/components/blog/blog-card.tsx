import { Button } from "@/components/ui/button";
import Link from "next/link";
import { User, User2Icon } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { EvmAddressDisplay } from "@/components/ui/metadata-display";

interface BlogCardProps {
  title: string;
  description?: string;
  address?: string;
  isUserBlog?: boolean;
  href: string;
  icon?: string | null;
}

export function BlogCard({ title, description, address, isUserBlog, href, icon }: BlogCardProps) {
  return (
    <div 
      className="flex p-4 items-stretch rounded-lg border border-border hover:bg-accent transition-colors"
    >
      <div className="w-24 h-24 rounded-md overflow-hidden relative shrink-0">
        {icon ? (
          <img
            src={icon}
            alt={`${title} icon`}
            className="w-full h-full"
          />
        ) : (
          <div className="w-full h-full bg-muted flex items-center justify-center">
            <User className="w-8 h-8 text-muted-foreground" />
          </div>
        )}
      </div>

      <div className="flex-1 pl-4">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-lg">{title}</h3>
              {isUserBlog && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <User2Icon className="h-4 w-4 text-muted-foreground" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Your personal blog page</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </div>
            <Link href={href}>
              <Button 
                variant={"ghostText"} 
                size="sm"
                className="transition-colors"
              >
                Manage
              </Button>
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">
            {description || "No description"}
          </p>
          {address && <EvmAddressDisplay address={address} />}
        </div>
      </div>
    </div>
  )
} 
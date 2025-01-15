"use client";

import { Account } from "@lens-protocol/client";
import { Link } from "lucide-react";

export const UserSite = ({ profile, className = "" }: { profile?: Account; className?: string }) => {
  const website = profile?.metadata?.attributes?.find((attr: any) => attr.key === "website")?.value;
  
  if (!website) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Link className="h-4 w-4 text-primary" />
      <a 
        href={website} 
        target="_blank" 
        rel="noopener noreferrer" 
        className="text-foreground/65 hover:text-foreground hover:underline underline-offset-4 transition-colors"
      >
        {website.replace(/^https?:\/\//, "")}
      </a>
    </div>
  );
}; 
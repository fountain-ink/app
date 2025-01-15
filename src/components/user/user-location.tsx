"use client";

import { Account } from "@lens-protocol/client";
import { Globe } from "lucide-react";

export const UserLocation = ({ profile, className = "" }: { profile?: Account; className?: string }) => {
  const location = profile?.metadata?.attributes?.find((attr: any) => attr.key === "location")?.value;

  if (!location) return null;

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <Globe className="h-4 w-4 text-foreground" />
      <span className="text-foreground/65">{location}</span>
    </div>
  );
};

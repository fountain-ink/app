"use client";

import { Copy } from "lucide-react";
import { Button } from "./button";
import { toast } from "sonner";

interface EvmAddressDisplayProps {
  address: string;
}

export function EvmAddressDisplay({ address }: EvmAddressDisplayProps) {
  const truncateUri = (uri: string) => {
    if (uri.length <= 12) return uri;
    return `${uri.slice(0, 4)}...${uri.slice(-4)}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(address);
      toast.success("Address copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  return (
    <div className="flex pt-1 text-xs text-muted-foreground  items-center gap-2">
      <code className="font-mono">{truncateUri(address)}</code>
      <Button variant="ghost" className="p-0 w-4 h-4" onClick={handleCopy}>
        <Copy className="w-3 h-3" />
      </Button>
    </div>
  );
}

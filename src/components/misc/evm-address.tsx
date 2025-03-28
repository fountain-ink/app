import { CopyIcon, CheckIcon } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EvmAddressProps {
  address: string;
  truncate?: boolean;
  showCopy?: boolean;
  className?: string;
}

export function EvmAddress({ address, truncate = false, showCopy = false, className }: EvmAddressProps) {
  const [copied, setCopied] = useState(false);

  const displayAddress = truncate
    ? `${address.slice(0, 6)}...${address.slice(-4)}`
    : address;

  const handleCopy = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <span className={cn("inline-flex items-center text-sm text-muted-foreground", className)}>
      <span>{displayAddress}</span>
      {showCopy && (
        <Button
          variant="ghost"
          size="sm"
          className="p-0 h-auto ml-1 overflow-visible min-w-0 min-h-0"
          onClick={handleCopy}
        >
          {copied ? (
            <CheckIcon className="h-3.5 w-3.5" />
          ) : (
            <CopyIcon className="h-3.5 w-3.5" />
          )}
          <span className="sr-only">Copy address</span>
        </Button>
      )}
    </span>
  );
} 
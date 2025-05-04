"use client";

import type { ConnectionStatus } from "@/hooks/use-yjs-state";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { Badge } from "./badge";

interface ConnectionBadgeProps {
  status: ConnectionStatus;
  error?: string;
  className?: string;
}

const statusConfig: Record<ConnectionStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  disconnected: { label: "Offline", variant: "destructive" },
  connecting: { label: "Connecting", variant: "secondary" },
  connected: { label: "Connected", variant: "default" },
  syncing: { label: "Syncing", variant: "secondary" },
  synced: { label: "Synced", variant: "default" },
};

export function ConnectionBadge({ status, error, className }: ConnectionBadgeProps) {
  const config = statusConfig[status];
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      setIsVisible(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [status]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <Badge variant={"outlineSecondary"} className={cn("cursor-default rounded-md select-none", className)} title={error}>
            {config.label}
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

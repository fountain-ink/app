"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { Badge } from "./badge";

export type SaveStatus = "saving" | "saved" | "error";

interface SaveBadgeProps {
  status: SaveStatus;
  error?: string | null;
  className?: string;
}

const statusConfig: Record<SaveStatus, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  saving: { label: "Saving", variant: "secondary" },
  saved: { label: "Saved", variant: "default" },
  error: { label: "Error", variant: "destructive" },
};

export function SaveBadge({ status, error, className }: SaveBadgeProps) {
  const config = statusConfig[status];
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    const timer = setTimeout(() => {
      if (status === "saved") {
        setIsVisible(false);
      }
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
          <Badge variant={"outline"} className={cn("cursor-default select-none", className)} title={error || undefined}>
            {config.label}
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
} 
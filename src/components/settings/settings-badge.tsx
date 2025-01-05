"use client";

import { settingsEvents } from "@/lib/settings/events";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Badge } from "../ui/badge";

type Status = {
  type: "saved" | "error";
  error?: string;
} | null;

interface SettingsBadgeProps {
  className?: string;
}

const statusConfig: Record<NonNullable<Status>["type"], { label: string; variant: "default" | "destructive" }> = {
  saved: { label: "Saved", variant: "default" },
  error: { label: "Error", variant: "destructive" },
};

export function SettingsBadge({ className }: SettingsBadgeProps) {
  const [status, setStatus] = useState<Status>(null);
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const unsubscribeSaved = settingsEvents.on("saved", () => {
      setStatus({ type: "saved" });
    });

    const unsubscribeError = settingsEvents.on("error", (error) => {
      setStatus({ type: "error", error });
      console.error("Settings error:", error);
    });

    return () => {
      unsubscribeSaved();
      unsubscribeError();
    };
  }, []);

  useEffect(() => {
    if (status) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }

      setIsVisible(true);
      timerRef.current = setTimeout(() => {
        setIsVisible(false);
        setStatus(null);
      }, 2000);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [status]);

  return (
    <AnimatePresence>
      {isVisible && status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <Badge variant={"outline"} className={cn("cursor-default select-none", className)} title={status.error}>
            {statusConfig[status.type].label}
          </Badge>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

"use client";

import { useRouter } from "next/navigation";
import { forwardRef } from "react";
import BellIcon from "@/components/icons/bell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useNotifications } from "./notifications-context";

interface NotificationButtonProps {
  className?: string;
}

const NotificationButton = forwardRef<HTMLButtonElement, NotificationButtonProps>(({ className }, ref) => {
  const router = useRouter();
  const { unreadCount } = useNotifications();

  const handleClick = () => {
    router.push("/notifications");
  };

  return (
    <div className="relative inline-flex">
      <Button
        ref={ref}
        variant="outline"
        size="icon"
        onClick={handleClick}
        className={cn(className)}
        aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
      >
        <BellIcon className="h-4 w-4" />
      </Button>
      {unreadCount > 0 && (
        <div className="absolute -bottom-1 -right-1 h-5 min-w-[20px] rounded-full bg-green-500 text-white px-1 text-xs font-medium flex items-center justify-center z-10">
          {unreadCount > 99 ? "99+" : unreadCount}
        </div>
      )}
    </div>
  );
});

NotificationButton.displayName = "NotificationButton";

export { NotificationButton };

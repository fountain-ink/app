"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import React, { createContext, useCallback, useContext, useEffect, useMemo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUIStore } from "@/stores/ui-store";

interface NotificationsContextType {
  notifications: any[];
  unreadCount: number;
  isLoading: boolean;
  error: Error | null;
  markAsRead: (notificationId: string) => void;
  markAllAsRead: () => void;
  refetch: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

interface NotificationsProviderProps {
  children: React.ReactNode;
}

export function NotificationsProvider({ children }: NotificationsProviderProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { setNotificationCount, lastNotificationCheck, setLastNotificationCheck, lastNotificationSeen, setLastNotificationSeen } = useUIStore();

  const {
    data: allNotifications = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["notifications", "all"],
    queryFn: async () => {
      const response = await fetch("/api/notifications?filter=all");
      if (!response.ok) {
        throw new Error("Failed to fetch notifications");
      }
      const data = await response.json();
      return data.notifications || [];
    },
    refetchInterval: 30000, // Poll every 30 seconds
    staleTime: 10000,
  });

  // Helper function to get notification timestamp
  const getNotificationTimestamp = (notification: any): number => {
    switch (notification.__typename) {
      case "FollowNotification":
        return new Date(notification.followers?.[0]?.followedAt || Date.now()).getTime();
      case "CommentNotification":
        return new Date(notification.comment?.timestamp || Date.now()).getTime();
      case "MentionNotification":
      case "RepostNotification":
      case "ReactionNotification":
        return new Date(notification.post?.timestamp || Date.now()).getTime();
      case "QuoteNotification":
        return new Date(notification.quote?.timestamp || Date.now()).getTime();
      case "PostActionExecutedNotification":
      case "AccountActionExecutedNotification":
        return new Date(notification.actions?.[0]?.executedAt || Date.now()).getTime();
      case "TokenDistributedNotification":
        return new Date(notification.timestamp || Date.now()).getTime();
      default:
        return Date.now();
    }
  };

  // Count unread as notifications created after last seen
  const unreadCount = useMemo(() => {
    if (!allNotifications.length) return 0;
    if (!lastNotificationSeen) return allNotifications.length;
    
    return allNotifications.filter((n: any) => {
      const notificationTime = getNotificationTimestamp(n);
      return notificationTime > lastNotificationSeen;
    }).length;
  }, [allNotifications, lastNotificationSeen]);

  useEffect(() => {
    setNotificationCount(unreadCount);
  }, [unreadCount, setNotificationCount]);

  // Individual notification read marking is not implemented
  // since Lens Protocol doesn't support it

  const markAsRead = useCallback(
    (notificationId: string) => {
      // Individual marking not supported
    },
    [],
  );

  const markAllAsRead = useCallback(() => {
    setLastNotificationSeen(Date.now());
  }, [setLastNotificationSeen]);

  const value: NotificationsContextType = {
    notifications: allNotifications,
    unreadCount,
    isLoading,
    error: error as Error | null,
    markAsRead,
    markAllAsRead,
    refetch,
  };

  return <NotificationsContext.Provider value={value}>{children}</NotificationsContext.Provider>;
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
}


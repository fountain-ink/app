"use client";

import { useMemo, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NotificationView } from "./notification-view";
import { useNotifications } from "./notifications-context";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

type FilterType = "all" | "posts" | "users";

export function NotificationsFeed() {
  const { notifications: allNotifications, isLoading: allLoading, error: allError, markAsRead, markAllAsRead, unreadCount } = useNotifications();
  const [activeTab, setActiveTab] = useState<FilterType>("all");

  // Fetch posts notifications
  const { data: postsNotifications = [], isLoading: postsLoading } = useQuery({
    queryKey: ["notifications", "posts"],
    queryFn: async () => {
      const response = await fetch("/api/notifications?filter=posts");
      if (!response.ok) {
        throw new Error("Failed to fetch posts notifications");
      }
      const data = await response.json();
      return data.notifications || [];
    },
    enabled: activeTab === "posts",
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Fetch users notifications
  const { data: usersNotifications = [], isLoading: usersLoading } = useQuery({
    queryKey: ["notifications", "users"],
    queryFn: async () => {
      const response = await fetch("/api/notifications?filter=users");
      if (!response.ok) {
        throw new Error("Failed to fetch users notifications");
      }
      const data = await response.json();
      return data.notifications || [];
    },
    enabled: activeTab === "users",
    refetchInterval: 30000,
    staleTime: 10000,
  });

  // Mark all notifications as read when the page loads
  useEffect(() => {
    if (allNotifications.length > 0 && !allLoading) {
      markAllAsRead();
    }
  }, [allNotifications.length, allLoading, markAllAsRead]);

  const getNotifications = () => {
    switch (activeTab) {
      case "posts":
        return postsNotifications;
      case "users":
        return usersNotifications;
      default:
        return allNotifications;
    }
  };

  const isLoading = activeTab === "all" ? allLoading : activeTab === "posts" ? postsLoading : usersLoading;
  const error = allError;

  if (isLoading) {
    return <NotificationsSuspense activeTab={activeTab} />;
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Failed to load notifications</p>
      </div>
    );
  }

  const notifications = getNotifications();

  if (notifications.length === 0 && !isLoading) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No notifications yet</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 mt-4">
        <h2 className="text-2xl font-semibold">Notifications</h2>
      </div>

      <Tabs defaultValue="all" className="flex-1 flex flex-col" value={activeTab} onValueChange={(value) => setActiveTab(value as FilterType)}>
        <div className="px-4 py-2">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
            <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="all" className="flex-1 m-0">
          <NotificationList notifications={allNotifications} markAsRead={markAsRead} />
        </TabsContent>
        <TabsContent value="posts" className="flex-1 m-0">
          <NotificationList notifications={postsNotifications} markAsRead={markAsRead} />
        </TabsContent>
        <TabsContent value="users" className="flex-1 m-0">
          <NotificationList notifications={usersNotifications} markAsRead={markAsRead} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationList({ 
  notifications, 
  markAsRead 
}: { 
  notifications: any[]; 
  markAsRead: (id: string) => void;
}) {
  if (notifications.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No notifications in this category</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-16rem)]">
      <div className="py-2">
        {notifications.map((notification, index) => (
          <NotificationView
            key={`${notification.__typename}-${index}`}
            notification={notification}
            onRead={() => markAsRead(`${notification.__typename}-${index}`)}
          />
        ))}
      </div>
    </ScrollArea>
  );
}

function NotificationsSuspense({ activeTab }: { activeTab: FilterType }) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 mt-4">
        <h2 className="text-2xl font-semibold">Notifications</h2>
      </div>

      <Tabs value={activeTab} className="flex-1 flex flex-col">
        <div className="px-4 py-2">
          <TabsList className="w-full max-w-md">
            <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
            <TabsTrigger value="posts" className="flex-1">Posts</TabsTrigger>
            <TabsTrigger value="users" className="flex-1">Users</TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value={activeTab} className="flex-1 m-0">
          <ScrollArea className="h-[calc(100vh-16rem)]">
            <div className="py-2 space-y-2">
              {[...Array(5)].map((_, i) => (
                <NotificationItemSkeleton key={i} />
              ))}
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function NotificationItemSkeleton() {
  return (
    <div className="flex items-start gap-3 p-4 rounded-lg mx-2">
      <Skeleton className="h-5 w-5 rounded-full flex-shrink-0 mt-0.5" />
      <div className="flex-1 min-w-0 space-y-2">
        <div className="flex items-center gap-2">
          <Skeleton className="h-5 w-5 rounded-full" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-32" />
        </div>
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}
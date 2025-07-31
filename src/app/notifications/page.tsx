import { Metadata } from "next";
import { redirect } from "next/navigation";
import { NotificationsFeed } from "@/components/notifications/notifications-feed";
import { getSession } from "@/lib/auth/get-session";

export const metadata: Metadata = {
  title: "Notifications",
  description: "View your notifications",
};

export default async function NotificationsPage() {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-6xl mx-auto">
        <NotificationsFeed />
      </div>
    </div>
  );
}


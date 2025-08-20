import { fetchNotifications } from "@lens-protocol/client/actions";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/get-session";
import { getLensClient } from "@/lib/lens/client";
import { env } from "@/env.js";
import { NotificationType } from "@lens-protocol/client";

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();
    const client = await getLensClient();

    if (!session || !client.isSessionClient()) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const cursor = searchParams.get("cursor") || undefined;
    const filterType = searchParams.get("filter") || "all";

    // Map filter types to notification types
    const getNotificationTypes = (filter: string): NotificationType[] | undefined => {
      switch (filter) {
        case "posts":
          return [
            NotificationType.Commented,
            NotificationType.Quoted,
            NotificationType.Reposted,
            NotificationType.Reacted
          ];
        case "users":
          return [
            NotificationType.Followed
          ];
        case "earnings":
          return [
            NotificationType.ExecutedPostAction,
            NotificationType.ExecutedAccountAction,
            NotificationType.TokenDistributed
          ];
        case "all":
          // Don't specify types - let the API return all notifications
          return undefined;
        default:
          return undefined; // All types
      }
    };
    
    const notificationTypes = getNotificationTypes(filterType);
    
    
    // Only apply app filter for posts tab (comments, quotes, reposts, reactions)
    // Users tab (follows, mentions) should NOT have app filter
    // Earnings tab should NOT have app filter
    // All tab should NOT have app filter to include everything
    const shouldFilterByApp = filterType === "posts";

    const result = await fetchNotifications(client, {
      cursor,
      filter: {
        ...(shouldFilterByApp ? { apps: [env.NEXT_PUBLIC_APP_ADDRESS] } : {}),
        ...(notificationTypes ? { notificationTypes } : {}),
      },
    });
    

    if (result.isErr()) {
      console.error("Error fetching notifications:", result.error);
      return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }

    return NextResponse.json({
      notifications: result.value.items,
      pageInfo: result.value.pageInfo,
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

// POST method removed since we don't support marking notifications as read
// Lens Protocol doesn't have this functionality


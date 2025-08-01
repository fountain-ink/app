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
    const getNotificationTypes = (filter: string) => {
      switch (filter) {
        case "posts":
          return ["COMMENTED", "QUOTED", "REPOSTED", "REACTED"];
        case "users":
          return ["FOLLOWED", "MENTIONED"];
        case "earnings":
          return ["EXECUTED_POST_ACTION", "EXECUTED_ACCOUNT_ACTION", "TOKEN_DISTRIBUTED"];
        default:
          return undefined; // All types
      }
    };

    // Determine which notification types need app filtering
    const appFilteredTypes = ["COMMENTED", "QUOTED", "REPOSTED", "REACTED", "MENTIONED"];
    
    const notificationTypes = getNotificationTypes(filterType);
    
    // Check if we should apply app filter based on the notification types being requested
    const shouldFilterByApp = filterType === "posts" || 
                             (filterType === "all" && true) || // For "all", we want app-filtered mentions
                             (notificationTypes && notificationTypes.some(type => appFilteredTypes.includes(type)));

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


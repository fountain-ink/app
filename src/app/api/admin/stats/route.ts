import { createServiceClient } from "@/lib/db/service";
import { NextRequest, NextResponse } from "next/server";
import { checkAdminRights } from "@/lib/auth/admin-middleware";

export async function GET(req: NextRequest) {
  try {
    const authResponse = await checkAdminRights(req);
    if (authResponse) {
      return authResponse;
    }

    const supabase = await createServiceClient();

    const { count: totalUsers, error: usersError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true });

    if (usersError) {
      console.error("Error fetching users count:", usersError);
      return NextResponse.json({ error: "Failed to fetch users stats" }, { status: 500 });
    }

    // Count guest users (address starts with "guest-")
    const { count: guestUsers, error: guestError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .like("handle", "guest-%");

    if (guestError) {
      console.error("Error fetching guest users count:", guestError);
      return NextResponse.json({ error: "Failed to fetch guest users stats" }, { status: 500 });
    }

    // Count authenticated users (address starts with "0x")
    const { count: authedUsers, error: authedError } = await supabase
      .from("users")
      .select("*", { count: "exact", head: true })
      .like("address", "0x%");

    if (authedError) {
      console.error("Error fetching authenticated users count:", authedError);
      return NextResponse.json({ error: "Failed to fetch authenticated users stats" }, { status: 500 });
    }

    // Get blogs stats
    const { count: totalBlogs, error: blogsError } = await supabase
      .from("blogs")
      .select("*", { count: "exact", head: true });

    if (blogsError) {
      console.error("Error fetching blogs count:", blogsError);
      return NextResponse.json({ error: "Failed to fetch blogs stats" }, { status: 500 });
    }

    // Get drafts stats
    const { count: totalDrafts, error: draftsError } = await supabase
      .from("drafts")
      .select("*", { count: "exact", head: true });

    if (draftsError) {
      console.error("Error fetching drafts count:", draftsError);
      return NextResponse.json({ error: "Failed to fetch drafts stats" }, { status: 500 });
    }

    // Get active users (users with at least one blog)
    const { count: activeUsers, error: activeError } = await supabase
      .from("blogs")
      .select("owner", { count: "exact", head: true })
      .not("owner", "is", null);

    if (activeError) {
      console.error("Error fetching active users count:", activeError);
      return NextResponse.json({ error: "Failed to fetch active users stats" }, { status: 500 });
    }

    return NextResponse.json({
      data: {
        users: {
          total: totalUsers || 0,
          guest: guestUsers || 0,
          evm: authedUsers || 0,
          other: (totalUsers || 0) - (guestUsers || 0) - (authedUsers || 0),
          active: activeUsers || 0
        },
        content: {
          blogs: totalBlogs || 0,
          drafts: totalDrafts || 0,
          total: (totalBlogs || 0) + (totalDrafts || 0)
        }
      }
    });

  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
} 
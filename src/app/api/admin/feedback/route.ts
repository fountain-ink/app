import { createClient } from "@/lib/db/server";
import { NextRequest, NextResponse } from "next/server";
import { checkAdminRights } from "@/lib/auth/admin-middleware";

export async function GET(req: NextRequest) {
  try {
    const authResponse = await checkAdminRights(req);
    if (authResponse) {
      return authResponse;
    }

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const type = url.searchParams.get("type");
    const sortBy = url.searchParams.get("sort_by") || "createdAt";
    const sortDirection = url.searchParams.get("sort_direction") || "desc";

    const supabase = await createClient();

    let query = supabase.from("feedback").select("*");

    if (status && status !== "all") {
      query = query.eq("status", status);
    }

    if (type && type !== "all") {
      query = query.eq("type", type);
    }

    const validSortFields = ["id", "createdAt", "status", "type", "resolvedAt"];
    const field = validSortFields.includes(sortBy) ? sortBy : "createdAt";
    const direction = sortDirection === "asc";

    query = query.order(field, { ascending: direction });

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching feedback:", error);
      return NextResponse.json({ error: "Failed to fetch feedback" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    // Check if the user is an admin
    const authResponse = await checkAdminRights(req);
    if (authResponse) {
      // Return the auth error response if authentication failed
      return authResponse;
    }

    const body = await req.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    const updateData: any = {
      status,
    };

    if (status === "completed") {
      updateData.resolvedAt = new Date().toISOString();
    }

    const { error } = await supabase.from("feedback").update(updateData).eq("id", id);

    if (error) {
      console.error("Error updating feedback:", error);
      return NextResponse.json({ error: "Failed to update feedback" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

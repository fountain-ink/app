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
    const address = url.searchParams.get("address");
    const supabase = await createClient();

    if (address) {
      const { data: existingBan, error } = await supabase
        .from("banlist")
        .select("address")
        .eq("address", address)
        .maybeSingle();

      if (error) {
        console.error("Error checking ban status:", error);
        return NextResponse.json({ error: "Failed to check ban status" }, { status: 500 });
      }
      return NextResponse.json({ isBanned: !!existingBan });
    }
    const { data, error } = await supabase.from("banlist").select("*").order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching banned authors:", error);
      return NextResponse.json({ error: "Failed to fetch banned authors" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const authResponse = await checkAdminRights(req);
    if (authResponse) {
      return authResponse;
    }

    const body = await req.json();
    const { address, reason, added_by } = body;

    if (!address || !reason) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: existingBan } = await supabase.from("banlist").select("*").eq("address", address).maybeSingle();

    if (existingBan) {
      return NextResponse.json({ error: "Author already banned" }, { status: 409 });
    }

    const { error } = await supabase.from("banlist").insert({
      address,
      reason,
      added_by,
    });

    if (error) {
      console.error("Error banning author:", error);
      return NextResponse.json({ error: "Failed to ban author" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const authResponse = await checkAdminRights(req);
    if (authResponse) {
      return authResponse;
    }

    const url = new URL(req.url);
    const address = url.searchParams.get("address");

    if (!address) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase.from("banlist").delete().eq("address", address);

    if (error) {
      console.error("Error unbanning author:", error);
      return NextResponse.json({ error: "Failed to unban author" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

import { createServiceClient } from "@/lib/db/service";
import { NextRequest, NextResponse } from "next/server";
import { checkAdminRights } from "@/lib/auth/admin-middleware";

export async function GET(req: NextRequest) {
  try {
    const authResponse = await checkAdminRights(req);
    if (authResponse) {
      return authResponse;
    }

    const url = new URL(req.url);
    const query = url.searchParams.get("query") || "";
    const address = url.searchParams.get("address") || "";
    const handle = url.searchParams.get("handle") || "";

    const supabase = await createServiceClient();

    if (address) {
      console.log(`Looking up blog by address: ${address}`);

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq('address', address)
        .single();

      if (error) {
        console.error(`Error looking up blog by address: ${error.message}`);
        if (error.code === 'PGRST116') { // "No rows returned" error
          return NextResponse.json({ data: null });
        }
        return NextResponse.json({ error: "Failed to lookup blog" }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    if (handle) {
      console.log(`Looking up blog by handle: ${handle}`);

      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq('handle', handle)
        .single();

      if (error) {
        console.error(`Error looking up blog by handle: ${error.message}`);
        if (error.code === 'PGRST116') { // "No rows returned" error
          return NextResponse.json({ data: null });
        }
        return NextResponse.json({ error: "Failed to lookup blog" }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Search query must be at least 2 characters" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .or(`title.ilike.%${query}%,handle.ilike.%${query}%,owner.ilike.%${query}%,address.ilike.%${query}%`)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error searching blogs:", error);
      return NextResponse.json({ error: "Failed to search blogs" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
} 
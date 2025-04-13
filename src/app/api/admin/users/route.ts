import { createServiceClient } from "@/lib/supabase/service";
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
    const exactAddress = url.searchParams.get("address") || "";
    const handle = url.searchParams.get("handle") || "";

    const supabase = await createServiceClient();

    if (exactAddress) {
      console.log(`Looking up user by address: ${exactAddress}`);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq('address', exactAddress)
        .single();

      if (error) {
        console.error(`Error looking up user by address: ${error.message}`);
        if (error.code === 'PGRST116') { // "No rows returned" error
          return NextResponse.json({ data: null });
        }
        return NextResponse.json({ error: "Failed to lookup user" }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    if (handle) {
      console.log(`Looking up user by handle: ${handle}`);

      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq('handle', handle)
        .single();

      if (error) {
        console.error(`Error looking up user by handle: ${error.message}`);
        if (error.code === 'PGRST116') { // "No rows returned" error
          return NextResponse.json({ data: null });
        }
        return NextResponse.json({ error: "Failed to lookup user" }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Search query must be at least 2 characters" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("users")
      .select("*")
      .or(`address.ilike.%${query}%,handle.ilike.%${query}%,email.ilike.%${query}%,name.ilike.%${query}%`)
      .limit(10);

    if (error) {
      console.error("Error searching users:", error);
      return NextResponse.json({ error: "Failed to search users" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
} 
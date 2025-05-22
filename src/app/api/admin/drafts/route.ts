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
    const documentId = url.searchParams.get("documentId") || "";
    const title = url.searchParams.get("title") || "";

    const supabase = await createServiceClient();

    if (documentId) {
      console.log(`Looking up draft by documentId: ${documentId}`);

      const { data, error } = await supabase.from("drafts").select("*").eq("documentId", documentId).single();

      if (error) {
        console.error(`Error looking up draft by documentId: ${error.message}`);
        if (error.code === "PGRST116") {
          // "No rows returned" error
          return NextResponse.json({ data: null });
        }
        return NextResponse.json({ error: "Failed to lookup draft" }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    if (title) {
      console.log(`Looking up draft by title: ${title}`);

      const { data, error } = await supabase.from("drafts").select("*").eq("title", title).single();

      if (error) {
        console.error(`Error looking up draft by title: ${error.message}`);
        if (error.code === "PGRST116") {
          // "No rows returned" error
          return NextResponse.json({ data: null });
        }
        return NextResponse.json({ error: "Failed to lookup draft" }, { status: 500 });
      }

      return NextResponse.json({ data });
    }

    if (!query || query.length < 2) {
      return NextResponse.json({ error: "Search query must be at least 2 characters" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("drafts")
      .select("*")
      .or(`title.ilike.%${query}%,documentId.eq.${query},author.ilike.%${query}%`)
      .order("updatedAt", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error searching drafts:", error);
      return NextResponse.json({ error: "Failed to search drafts" }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

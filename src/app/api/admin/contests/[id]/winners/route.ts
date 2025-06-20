import { NextRequest, NextResponse } from "next/server";
import { checkAdminRights } from "@/lib/auth/admin-middleware";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { createClient } from "@/lib/db/server";

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResponse = await checkAdminRights(req);
    if (authResponse) return authResponse;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contest_winners")
      .select("*")
      .eq("contest_id", params.id)
      .order("place", { ascending: true });

    if (error) {
      console.error("Error fetching winners:", error);
      return NextResponse.json({ error: "Failed to fetch winners" }, { status: 500 });
    }

    return NextResponse.json(data || []);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResponse = await checkAdminRights(req);
    if (authResponse) return authResponse;

    const claims = await getTokenClaims();
    const adminAddress = claims?.metadata?.address;

    const body = await req.json();
    const { post_slug, place, prize_amount, transaction_hash } = body;

    if (!post_slug || !place || !prize_amount) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("contest_winners")
      .insert({
        contest_id: params.id,
        post_slug,
        place,
        prize_amount,
        transaction_hash,
        added_by: adminAddress || "unknown",
      })
      .select()
      .single();

    if (error) {
      console.error("Error adding winner:", error);
      if (error.code === "23505") {
        return NextResponse.json({ error: "This place or post is already assigned" }, { status: 409 });
      }
      return NextResponse.json({ error: "Failed to add winner" }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authResponse = await checkAdminRights(req);
    if (authResponse) return authResponse;

    const url = new URL(req.url);
    const winnerId = url.searchParams.get("id");

    if (!winnerId) {
      return NextResponse.json({ error: "Winner ID required" }, { status: 400 });
    }

    const supabase = await createClient();
    const { error } = await supabase
      .from("contest_winners")
      .delete()
      .eq("id", Number.parseInt(winnerId))
      .eq("contest_id", params.id);

    if (error) {
      console.error("Error removing winner:", error);
      return NextResponse.json({ error: "Failed to remove winner" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

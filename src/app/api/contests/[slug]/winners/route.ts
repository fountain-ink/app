import { NextRequest, NextResponse } from "next/server";
import { createServiceClient } from "@/lib/db/service";

export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  try {
    const supabase = await createServiceClient();

    // First get the contest by slug
    const { data: contest, error: contestError } = await supabase
      .from("contests")
      .select("id, name, theme, prize_pool")
      .eq("slug", params.slug)
      .single();

    if (contestError || !contest) {
      return NextResponse.json({ error: "Contest not found" }, { status: 404 });
    }

    // Then get ALL posts for this contest (winners)
    const { data: winners, error: winnersError } = await supabase
      .from("contest_winners")
      .select("*")
      .eq("contest_id", contest.id)
      .order("place", { ascending: true });

    if (winnersError) {
      console.error("Error fetching winners:", winnersError);
      return NextResponse.json({ error: "Failed to fetch winners" }, { status: 500 });
    }

    // Create a map of post slugs to winner data for easy lookup
    const winnerMap = new Map();
    winners?.forEach((winner) => {
      winnerMap.set(winner.post_slug, {
        place: winner.place,
        prize_amount: winner.prize_amount,
        transaction_hash: winner.transaction_hash,
      });
    });

    return NextResponse.json({
      contest: {
        id: contest.id,
        name: contest.name,
        theme: contest.theme,
        prize_pool: contest.prize_pool,
      },
      winners: winners || [],
      winnerMap: Object.fromEntries(winnerMap),
    });
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 });
  }
}

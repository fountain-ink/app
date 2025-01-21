import { env } from "@/env";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { verifyToken } from "@/lib/auth/verify-token";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

type FeedbackType = "bug" | "feature" | "other";

interface FeedbackPayload {
  type?: FeedbackType;
  text?: string;
  screenshot?: string;
}

export async function POST(req: NextRequest) {
  try {
    const appToken = req.cookies.get("appToken")?.value;
    const verified = verifyToken(appToken, env.SUPABASE_JWT_SECRET);
    if (!appToken || !verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(appToken);
    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createClient();
    const address = claims.sub;

    const body = await req.json();
    const { type, text, screenshot } = body as FeedbackPayload;

    if (!text || !type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const { data, error } = await db
      .from("feedback")
      .insert({
        text,
        type,
        screenshot,
        createdAt: new Date().toISOString(),
        author: address,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ message: "Feedback submitted successfully", feedback: data }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error(error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}

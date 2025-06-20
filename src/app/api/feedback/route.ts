import { type NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth/verify-auth-request";
import { createClient } from "@/lib/db/server";

type FeedbackType = "bug" | "feature" | "other";

interface FeedbackPayload {
  type?: FeedbackType;
  text?: string;
  screenshot?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { claims, error: authError } = verifyAuth(req);
    if (authError) {
      return authError;
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

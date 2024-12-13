import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";
import { type NextRequest, NextResponse } from "next/server";

type FeedbackType = "bug" | "feature" | "other";

interface FeedbackPayload {
  type?: FeedbackType;
  text?: string;
  screenshot?: string;
}

export async function POST(req: NextRequest) {
  try {
    const { profileId, db } = await getAuthWithCookies();

    if (!db || !profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { type, text, screenshot } = body as FeedbackPayload;

    const { data, error } = await db
      .from("feedback")
      .insert({
        userId: profileId,
        type,
        text,
        screenshot,
        createdAt: new Date().toISOString(),
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

import { createLensClient } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";
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
    const lens = await createLensClient();
    const { profileId, handle } = await getUserProfile(lens);
    const db = await createClient();

    if (!db || !profileId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
        userId: profileId,
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

import { createServiceClient } from "@/lib/supabase/service";
import { revalidateTag } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

interface UserMetadata {
  blog?: {
    title?: string;
    showAuthor?: boolean;
    showTags?: boolean;
    showTitle?: boolean;
  };
  theme?: {
    name?: string;
    customColor?: string;
    customBackground?: string;
  };
}

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest, { params }: { params: { user: string } }) {
  try {
    const db = await createServiceClient();
    const { data, error } = await db
      .from("users")
      .select("metadata")
      .eq("profileId", params.user)
      .single();

    if (error) {
      console.error("Error fetching user settings:", error);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    // Only return public settings needed for rendering the user page
    const metadata = data?.metadata as UserMetadata;
    const publicSettings = {
      blog: {
        title: metadata?.blog?.title,
        showAuthor: metadata?.blog?.showAuthor,
        showTags: metadata?.blog?.showTags,
        showTitle: metadata?.blog?.showTitle,
      },
      theme: metadata?.theme,
    };

    return NextResponse.json({ settings: publicSettings }, {
      headers: {
        'Cache-Control': 'no-store',
        'tags': `user-${params.user}-settings`
      }
    });
  } catch (error) {
    console.error("Error in settings fetch:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch settings" },
      { status: 500 },
    );
  }
} 
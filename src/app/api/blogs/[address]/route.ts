import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function PUT(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const token = req.cookies.get("appToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(token);
    if (!claims?.metadata?.address) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { settings } = await req.json();
    if (!settings) {
      return NextResponse.json({ error: "No settings provided" }, { status: 400 });
    }

    const db = await createClient();

    // First check if the blog exists and if the user owns it
    const { data: blog } = await db
      .from("blogs")
      .select("owner")
      .eq("address", params.address)
      .single();

    if (blog && blog.owner !== claims.metadata.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const blogData = {
      address: params.address,
      title: settings.title,
      about: settings.about,
      handle: settings.handle,
      metadata: {
        showAuthor: settings.metadata?.showAuthor ?? true,
        showTags: settings.metadata?.showTags ?? true,
        showTitle: settings.metadata?.showTitle ?? true,
      },
      icon: settings.icon,
      updated_at: new Date().toISOString(),
      owner: claims.metadata.address,
    };

    const { error } = blog
      ? await db
          .from("blogs")
          .update(blogData)
          .eq("address", params.address)
      : await db.from("blogs").insert({
          ...blogData,
          created_at: new Date().toISOString(),
        });

    if (error) {
      console.error("Error updating blog settings:", error);
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in blog settings update:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { address: string } }
) {
  try {
    const token = req.cookies.get("appToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(token);
    if (!claims?.metadata?.address) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const db = await createClient();
    const { data: blog, error } = await db
      .from("blogs")
      .select("*")
      .eq("address", params.address)
      .single();

    if (error) {
      console.error("Error fetching blog settings:", error);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error("Error in blog settings fetch:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic"; 
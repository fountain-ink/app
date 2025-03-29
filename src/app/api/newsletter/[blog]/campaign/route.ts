import { createCampaignForPost } from "@/lib/listmonk/client";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findBlogByIdentifier } from "@/lib/utils/find-blog-by-id";
import { getTokenClaims } from "@/lib/auth/get-token-claims";

export async function POST(req: NextRequest, { params }: { params: { blog: string } }) {
  try {
    const token = req.cookies.get("appToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(token);
    if (!claims?.metadata?.address) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userAddress = claims.metadata.address;

    const db = await createClient();
    const { data: blog, error } = await findBlogByIdentifier(db, params.blog);

    if (error || !blog) {
      console.error("Error fetching blog data:", error);
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (blog.owner !== userAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    if (!blog.mail_list_id) {
      return NextResponse.json({ error: "Blog does not have a mailing list" }, { status: 400 });
    }

    const body = await req.json();
    const { postSlug, postMetadata } = body;

    if (!postSlug) {
      return NextResponse.json({ error: "Post slug is required" }, { status: 400 });
    }

    const campaign = await createCampaignForPost(blog.mail_list_id, params.blog, postSlug, userAddress, postMetadata);

    if (!campaign) {
      return NextResponse.json({ error: "Failed to create campaign" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Campaign created and started successfully",
      data: { campaignId: campaign.id },
    });
  } catch (error) {
    console.error("Error creating campaign for post:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create campaign for post" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";

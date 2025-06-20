import { NextRequest, NextResponse } from "next/server";
import { createCampaignForPost } from "@/lib/listmonk/client";
import { getVerifiedBlog } from "../../utils";

export async function POST(req: NextRequest, { params }: { params: { blog: string } }) {
  try {
    const result = await getVerifiedBlog(req, params.blog);
    if (result.error) return result.error;
    const { blog, userAddress } = result;

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

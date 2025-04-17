import { deleteList, getListById } from "@/lib/listmonk/client";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/server";
import { findBlogByIdentifier } from "@/lib/utils/find-blog-by-id";
import { getTokenClaims } from "@/lib/auth/get-token-claims";

export async function DELETE(req: NextRequest, { params }: { params: { blog: string } }) {
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
      return NextResponse.json({ error: "Blog doesn't have a mailing list" }, { status: 400 });
    }

    const success = await deleteList(blog.mail_list_id);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete mailing list" }, { status: 500 });
    }

    const { error: updateError } = await db
      .from("blogs")
      .update({
        mail_list_id: null,
        metadata: {
          ...(blog.metadata || {}),
          newsletterEnabled: false,
        },
      })
      .eq("address", blog.address);

    if (updateError) {
      console.error("Error updating blog:", updateError);
      return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting newsletter:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete newsletter" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";

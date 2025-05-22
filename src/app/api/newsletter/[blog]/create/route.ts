import { createList } from "@/lib/listmonk/client";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/server";
import { findBlogByIdentifier } from "@/lib/utils/find-blog-by-id";
import { verifyAuth } from "@/lib/auth/verify-auth-request";

export async function POST(req: NextRequest, { params }: { params: { blog: string } }) {
  try {
    const { claims, error: authError } = verifyAuth(req);
    if (authError) {
      return authError;
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

    if (blog.mail_list_id) {
      return NextResponse.json({
        success: true,
        message: "Blog already has a mailing list",
        data: { listId: blog.mail_list_id },
      });
    }

    const blogTitle = blog.title || `Blog (${blog.address})`;
    const listName = `${blog.address}`;
    const description = `Subscribers to the blog "${blogTitle} (${blog.address})"`;

    const list = await createList(listName, description);

    if (!list) {
      return NextResponse.json({ error: "Failed to create mailing list" }, { status: 500 });
    }

    const { error: updateError } = await db.from("blogs").update({ mail_list_id: list.id }).eq("address", blog.address);

    if (updateError) {
      console.error("Error updating blog with mail_list_id:", updateError);
      return NextResponse.json({ error: "Failed to update blog with mailing list ID" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully created mailing list for the blog",
      data: {
        listId: list.id,
        listName: list.name,
      },
    });
  } catch (error) {
    console.error("Error creating mailing list for blog:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create mailing list for blog" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";

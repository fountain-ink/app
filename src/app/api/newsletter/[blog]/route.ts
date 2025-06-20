import { NextRequest, NextResponse } from "next/server";
import { createList, deleteList } from "@/lib/listmonk/client";
import { getVerifiedBlog } from "../utils";

export async function POST(req: NextRequest, { params }: { params: { blog: string } }) {
  const result = await getVerifiedBlog(req, params.blog);
  if (result.error) return result.error;
  const { db, blog } = result;

  if (blog.mail_list_id) {
    return NextResponse.json({
      success: true,
      message: "Blog already has a mailing list",
      data: { listId: blog.mail_list_id },
    });
  }

  const blogTitle = blog.title || `Blog (${blog.address})`;
  const listName = `${blog.address}`;
  const description = `Subscribers to the blog \"${blogTitle} (${blog.address})\"`;

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
    data: { listId: list.id, listName: list.name },
  });
}

export async function DELETE(req: NextRequest, { params }: { params: { blog: string } }) {
  const result = await getVerifiedBlog(req, params.blog);
  if (result.error) return result.error;
  const { db, blog } = result;

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
      metadata: { ...(blog.metadata || {}), newsletterEnabled: false },
    })
    .eq("address", blog.address);

  if (updateError) {
    console.error("Error updating blog:", updateError);
    return NextResponse.json({ error: "Failed to update blog" }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export const dynamic = "force-dynamic";

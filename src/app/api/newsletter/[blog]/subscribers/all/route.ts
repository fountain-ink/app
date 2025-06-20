import { NextRequest, NextResponse } from "next/server";
import { deleteAllSubscribersFromList } from "@/lib/listmonk/client";
import { getVerifiedBlog } from "../../../utils";

export async function DELETE(req: NextRequest, { params }: { params: { blog: string } }) {
  const result = await getVerifiedBlog(req, params.blog);
  if (result.error) return result.error;
  const { blog } = result;

  if (!blog.mail_list_id) {
    return NextResponse.json({ error: "This blog doesn't have a mailing list yet" }, { status: 400 });
  }

  try {
    const success = await deleteAllSubscribersFromList(blog.mail_list_id);

    if (!success) {
      throw new Error("Failed to delete all subscribers");
    }

    return NextResponse.json({
      success: true,
      message: "Successfully deleted all subscribers",
    });
  } catch (error) {
    console.error("Error deleting all subscribers:", error);
    return NextResponse.json({ error: "Failed to delete all subscribers" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

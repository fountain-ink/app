import { NextRequest, NextResponse } from "next/server";
import { getVerifiedBlog } from "../../../utils";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { blog: string } }
) {
  const result = await getVerifiedBlog(req, params.blog);
  if (result.error) return result.error;
  const { blog } = result;

  if (!blog.mail_list_id) {
    return NextResponse.json(
      { error: "This blog doesn't have a mailing list yet" },
      { status: 400 }
    );
  }

  try {
    // Use Listmonk's query-based delete to delete all subscribers in this list
    const response = await fetch(`${process.env.LISTMONK_API_URL}/subscribers/query/delete`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from(`${process.env.LISTMONK_API_USERNAME}:${process.env.LISTMONK_API_TOKEN}`).toString("base64")}`,
      },
      body: JSON.stringify({
        query: `subscribers.id IN (SELECT subscriber_id FROM subscriber_lists WHERE list_id = ${blog.mail_list_id})`
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete all subscribers");
    }

    return NextResponse.json({
      success: true,
      message: "Successfully deleted all subscribers"
    });
  } catch (error) {
    console.error("Error deleting all subscribers:", error);
    return NextResponse.json(
      { error: "Failed to delete all subscribers" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
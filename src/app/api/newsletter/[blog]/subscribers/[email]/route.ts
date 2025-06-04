import { NextRequest, NextResponse } from "next/server";
import { getVerifiedBlog } from "../../../utils";
import { deleteSubscriber, findSubscriberByEmail, getSubscribers } from "@/lib/listmonk/client";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { blog: string; email: string } }
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

  const decodedEmail = decodeURIComponent(params.email);

  try {
    // First find the subscriber to get their ID
    const subscriber = await findSubscriberByEmail(decodedEmail);
    
    if (!subscriber) {
      return NextResponse.json(
        { error: "Subscriber not found" },
        { status: 404 }
      );
    }

    // Check if the subscriber is in this blog's mailing list
    const isInList = subscriber.lists?.some(list => list.id === blog.mail_list_id);
    
    if (!isInList) {
      return NextResponse.json(
        { error: "Subscriber is not in this blog's mailing list" },
        { status: 404 }
      );
    }

    // Delete the subscriber
    const success = await deleteSubscriber(subscriber.id);
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to remove subscriber" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Subscriber removed successfully"
    });
  } catch (error) {
    console.error("Error removing subscriber:", error);
    return NextResponse.json(
      { error: "Failed to remove subscriber" },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";
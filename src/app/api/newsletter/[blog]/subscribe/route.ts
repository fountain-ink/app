import { getListById, addSubscriber } from "@/lib/listmonk/client";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { findBlogByIdentifier } from "@/lib/utils/find-blog-by-id";

export async function POST(req: NextRequest, { params }: { params: { blog: string } }) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
    }

    const db = await createClient();
    const { data: blog, error } = await findBlogByIdentifier(db, params.blog);

    if (error || !blog) {
      console.error("Error fetching blog data:", error);
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    if (!blog.mail_list_id) {
      return NextResponse.json(
        {
          error: "This blog doesn't have a mailing list yet",
          needsListCreation: true,
        },
        { status: 400 },
      );
    }

    const list = await getListById(blog.mail_list_id);

    if (!list) {
      return NextResponse.json(
        {
          error: "Mailing list not found",
          needsListCreation: true,
        },
        { status: 400 },
      );
    }

    const subscriber = await addSubscriber(email, blog.mail_list_id);

    if (!subscriber) {
      return NextResponse.json({ error: "Failed to add subscriber" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to the blog",
      data: {
        listId: list.id,
        listName: list.name,
        subscriberId: subscriber.id,
        email: subscriber.email,
      },
    });
  } catch (error) {
    console.error("Error subscribing to blog:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to subscribe to blog" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";

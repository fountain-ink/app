import { getListById, importSubscribers } from "@/lib/listmonk/client";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/server";
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

    const formData = await req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
    }

    if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
      return NextResponse.json({ error: "Invalid file format. Please upload a CSV file" }, { status: 400 });
    }

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

    const success = await importSubscribers(file, [blog.mail_list_id]);

    if (!success) {
      return NextResponse.json({ error: "Failed to import subscribers" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Successfully imported subscribers to the blog",
      data: {
        listId: list.id,
        listName: list.name,
      },
    });
  } catch (error) {
    console.error("Error importing subscribers to blog:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to import subscribers to blog" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";

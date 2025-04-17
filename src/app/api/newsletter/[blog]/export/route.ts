import { getListById, getSubscribers } from "@/lib/listmonk/client";
import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/server";
import { findBlogByIdentifier } from "@/lib/utils/find-blog-by-id";
import { getTokenClaims } from "@/lib/auth/get-token-claims";

export async function GET(req: NextRequest, { params }: { params: { blog: string } }) {
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

    const subscribers = await getSubscribers(blog.mail_list_id);

    if (!subscribers) {
      return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
    }

    const headers = ["email", "name", "status", "created_at"];
    const rows = subscribers.data.results.map((sub) => [
      sub.email,
      sub.name,
      sub.status,
      new Date(sub.created_at).toISOString().split("T")[0],
    ]);

    const csv = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    // Return CSV as a downloadable file
    return new NextResponse(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename="subscribers-${blog.address}-${new Date().toISOString().split("T")[0]}.csv"`,
      },
    });
  } catch (error) {
    console.error("Error exporting subscribers:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to export subscribers" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic";

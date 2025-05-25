import { getListById, importSubscribers, getSubscribers } from "@/lib/listmonk/client";
import { NextRequest, NextResponse } from "next/server";
import { getVerifiedBlog } from "../../utils";

export async function GET(req: NextRequest, { params }: { params: { blog: string } }) {
  const result = await getVerifiedBlog(req, params.blog);
  if (result.error) return result.error;
  const { blog } = result;

  if (!blog.mail_list_id) {
    return NextResponse.json(
      { error: "This blog doesn't have a mailing list yet", needsListCreation: true },
      { status: 400 },
    );
  }

  const list = await getListById(blog.mail_list_id);
  if (!list) {
    return NextResponse.json({ error: "Mailing list not found", needsListCreation: true }, { status: 400 });
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

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="subscribers-${blog.address}-${
        new Date().toISOString().split("T")[0]
      }.csv"`,
    },
  });
}

export async function POST(req: NextRequest, { params }: { params: { blog: string } }) {
  const result = await getVerifiedBlog(req, params.blog);
  if (result.error) return result.error;
  const { blog } = result;

  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
  }

  if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
    return NextResponse.json({ error: "Invalid file format. Please upload a CSV file" }, { status: 400 });
  }

  if (!blog.mail_list_id) {
    return NextResponse.json(
      { error: "This blog doesn't have a mailing list yet", needsListCreation: true },
      { status: 400 },
    );
  }

  const list = await getListById(blog.mail_list_id);
  if (!list) {
    return NextResponse.json({ error: "Mailing list not found", needsListCreation: true }, { status: 400 });
  }

  const success = await importSubscribers(file, [blog.mail_list_id]);
  if (!success) {
    return NextResponse.json({ error: "Failed to import subscribers" }, { status: 500 });
  }

  return NextResponse.json({
    success: true,
    message: "Successfully imported subscribers to the blog",
    data: { listId: list.id, listName: list.name },
  });
}

export const dynamic = "force-dynamic";

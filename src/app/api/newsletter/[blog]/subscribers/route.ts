import { NextRequest, NextResponse } from "next/server";
import {
  bulkDeleteSubscribers,
  deleteSubscriber,
  escapeSqlString,
  findSubscriberByEmail,
  getListById,
  getSubscribers,
  importSubscribers,
} from "@/lib/listmonk/client";
import { getVerifiedBlog } from "../../utils";

export const runtime = 'nodejs';
export const maxDuration = 60;

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

  const acceptHeader = req.headers.get("accept");
  if (acceptHeader?.includes("application/json")) {
    const url = new URL(req.url);
    const page = Number.parseInt(url.searchParams.get("page") || "1");
    const per_page = Number.parseInt(url.searchParams.get("per_page") || "20");
    const search = url.searchParams.get("search") || "";

    let subscribersData: any;
    if (search) {
      const sanitized = escapeSqlString(search);
      subscribersData = await getSubscribers(blog.mail_list_id, page, per_page, `email LIKE '%${sanitized}%'`);
    } else {
      subscribersData = await getSubscribers(blog.mail_list_id, page, per_page);
    }

    if (!subscribersData) {
      return NextResponse.json({ error: "Failed to fetch subscribers" }, { status: 500 });
    }

    const tableData = subscribersData.data.results.map((sub: any) => ({
      id: sub.id.toString(),
      email: sub.email,
      created_at: sub.created_at,
      status: sub.status,
    }));

    return NextResponse.json({
      subscribers: tableData,
      total: subscribersData.data.total,
      page: subscribersData.data.page,
      per_page: subscribersData.data.per_page,
    });
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

  const contentType = req.headers.get("content-type");

  // Handle JSON request for adding individual emails
  if (contentType?.includes("application/json")) {
    const body = await req.json();
    const { emails } = body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return NextResponse.json({ error: "Emails array is required" }, { status: 400 });
    }

    let added = 0;
    let updated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const email of emails) {
      const trimmedEmail = email.trim().toLowerCase();

      // Basic email validation
      if (!trimmedEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        failed++;
        errors.push(`Invalid email: ${email}`);
        continue;
      }

      try {
        // First check if subscriber already exists
        const response = await fetch(`${process.env.LISTMONK_API_URL}/subscribers`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Basic ${Buffer.from(`${process.env.LISTMONK_API_USERNAME}:${process.env.LISTMONK_API_TOKEN}`).toString("base64")}`,
          },
          body: JSON.stringify({
            email: trimmedEmail,
            name: trimmedEmail.split("@")[0],
            status: "enabled",
            lists: [blog.mail_list_id],
            preconfirm_subscription: true,
          }),
        });

        if (response.ok) {
          added++;
        } else if (response.status === 409) {
          // Subscriber exists, try to add to list
          updated++;
        } else {
          failed++;
          errors.push(`Failed to add: ${email}`);
        }
      } catch (error) {
        failed++;
        errors.push(`Error adding ${email}: ${error instanceof Error ? error.message : "Unknown error"}`);
      }
    }

    let message = "";
    if (added > 0 && updated > 0) {
      message = `Added ${added} new subscriber(s), updated ${updated} existing subscriber(s)`;
    } else if (added > 0) {
      message = `Added ${added} new subscriber(s)`;
    } else if (updated > 0) {
      message = `Updated ${updated} existing subscriber(s)`;
    }

    return NextResponse.json({
      success: true,
      message,
      added,
      updated,
      failed,
      errors: errors.length > 0 ? errors : undefined,
    });
  }

  // Handle FormData request for CSV import
  const formData = await req.formData();
  const file = formData.get("file") as File;

  if (!file) {
    return NextResponse.json({ error: "CSV file is required" }, { status: 400 });
  }

  if (!file.name.endsWith(".csv") && file.type !== "text/csv") {
    return NextResponse.json({ error: "Invalid file format. Please upload a CSV file" }, { status: 400 });
  }

  try {
    const text = await file.text();
    const lines = text.trim().split("\n");

    if (lines.length < 2) {
      return NextResponse.json({ error: "CSV file is empty or has no data rows" }, { status: 400 });
    }

    const headers = lines[0]?.split(",").map((h) => h.trim().replace(/^["']|["']$/g, "")) || [];
    const emailColumnVariations = [
      "email",
      "subscriberEmail",
      "subscriber_email",
      "Email",
      "SubscriberEmail",
      "subscriber-email",
      "e-mail",
      "E-mail",
    ];
    const emailColumnIndex = headers.findIndex((h) => emailColumnVariations.includes(h));

    if (emailColumnIndex === -1) {
      return NextResponse.json(
        {
          error:
            "Could not find email column. Please ensure your CSV has one of these columns: " +
            emailColumnVariations.join(", "),
        },
        { status: 400 },
      );
    }

    const statusColumnVariations = ["status", "Status", "subscription_status", "subscriptionStatus"];
    const statusColumnIndex = headers.findIndex((h) => statusColumnVariations.includes(h));

    const processedEmails: string[] = [];
    let skippedCount = 0;

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line) continue;

      const values = line.split(",").map((v) => v.trim().replace(/^["']|["']$/g, ""));

      if (values.length <= emailColumnIndex) continue;

      const email = values[emailColumnIndex];
      if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) continue;

      // Check status if column exists
      if (statusColumnIndex !== -1 && values.length > statusColumnIndex) {
        const status = values[statusColumnIndex];
        if (status && !["ACTIVE", "active", "Active"].includes(status)) {
          skippedCount++;
          continue;
        }
      }

      processedEmails.push(email);
    }

    if (processedEmails.length === 0) {
      return NextResponse.json(
        {
          error: `No valid email addresses found to import. ${skippedCount > 0 ? `Skipped ${skippedCount} non-active subscribers.` : ""}`,
        },
        { status: 400 },
      );
    }

    // Create a new CSV file with just the email column for Listmonk
    const newCsvContent = "email\n" + processedEmails.join("\n");
    
    const blob = new Blob([newCsvContent], { type: "text/csv" });
    const newFile = new File([blob], "processed_subscribers.csv", { type: "text/csv" });
    
    console.log("CSV import debug:", {
      blogSlug: params.blog,
      listId: blog.mail_list_id,
      emailCount: processedEmails.length,
      fileSize: newFile.size,
      fileType: newFile.type,
      fileName: newFile.name,
      sampleEmails: processedEmails.slice(0, 3),
    });

    const success = await importSubscribers(newFile, [blog.mail_list_id]);
    if (!success) {
      console.error("Failed to import subscribers to Listmonk", {
        listId: blog.mail_list_id,
        emailCount: processedEmails.length,
        blogSlug: params.blog,
      });
      return NextResponse.json({ error: "Failed to import subscribers to Listmonk. Please check the server logs." }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully imported ${processedEmails.length} subscribers to the blog${skippedCount > 0 ? `. Skipped ${skippedCount} non-active subscribers.` : ""}`,
      data: {
        listId: list?.id || blog.mail_list_id,
        listName: list?.name || "Blog mailing list",
        imported: processedEmails.length,
        skipped: skippedCount,
      },
    });
  } catch (error) {
    console.error("Error processing CSV file:", error);
    if (error instanceof Error) {
      console.error("Error details:", {
        message: error.message,
        stack: error.stack,
        blogSlug: params.blog,
      });
      
      if (error.message.includes("Failed to fetch")) {
        return NextResponse.json(
          {
            error: "Failed to connect to newsletter service. Please try again later.",
          },
          { status: 503 },
        );
      }
    }
    
    return NextResponse.json(
      {
        error: "Failed to process CSV file. Please ensure it's properly formatted.",
      },
      { status: 500 },
    );
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { blog: string } }) {
  const result = await getVerifiedBlog(req, params.blog);
  if (result.error) return result.error;
  const { blog } = result;

  if (!blog.mail_list_id) {
    return NextResponse.json({ error: "This blog doesn't have a mailing list yet" }, { status: 400 });
  }

  try {
    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (email) {
      const decodedEmail = decodeURIComponent(email);
      const subscriber = await findSubscriberByEmail(decodedEmail);

      if (!subscriber) {
        return NextResponse.json({ error: "Subscriber not found" }, { status: 404 });
      }

      const isInList = subscriber.lists?.some((list) => list.id === blog.mail_list_id);

      if (!isInList) {
        return NextResponse.json({ error: "Subscriber is not in this blog's mailing list" }, { status: 404 });
      }

      const success = await deleteSubscriber(subscriber.id);

      if (!success) {
        return NextResponse.json({ error: "Failed to remove subscriber" }, { status: 500 });
      }

      return NextResponse.json({ success: true, message: "Subscriber removed successfully" });
    }

    const body = await req.json();
    const { subscriber_ids } = body;

    if (!subscriber_ids || !Array.isArray(subscriber_ids) || subscriber_ids.length === 0) {
      return NextResponse.json({ error: "Subscriber IDs array is required" }, { status: 400 });
    }

    const success = await bulkDeleteSubscribers(subscriber_ids);

    if (!success) {
      return NextResponse.json({ error: "Failed to delete subscribers" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${subscriber_ids.length} subscribers`,
    });
  } catch (error) {
    console.error("Error bulk deleting subscribers:", error);
    return NextResponse.json({ error: "Failed to delete subscribers" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";

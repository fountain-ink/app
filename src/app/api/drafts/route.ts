import { env } from "@/env";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { verifyAuth } from "@/lib/auth/verify-auth-request";
import { getRandomUid } from "@/lib/get-random-uid";
import { createClient } from "@/lib/db/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { claims, error: authError } = verifyAuth(req);
    if (authError) {
      return authError;
    }

    const db = await createClient();
    const address = claims.sub;

    if (!claims.metadata.isAnonymous) {
      const { address: userAddress } = await getUserAccount();

      if (userAddress !== address) {
        return NextResponse.json({ error: "Invalid profile" }, { status: 401 });
      }
    }

    const documentIdParam = req.nextUrl.searchParams.get("id"); // Renamed for clarity

    if (documentIdParam) {
      const { data: draft, error } = await db
        .from("drafts")
        .select(`
          id,
          documentId,
          title,
          subtitle,
          author,
          createdAt,
          updatedAt,
          contentHtml,
          coverUrl,
          contentJson,         // Added
          isCollaborative      // Added
        `)
        .eq("documentId", documentIdParam)
        .eq("author", address)
        .single();

      if (error) {
        console.error("Error fetching draft:", error.message);
        // Consider if specific error types (e.g., not found vs. server error) need different handling
        throw new Error(`Error fetching draft: ${error.message}`);
      }

      if (!draft) {
        return NextResponse.json({ error: "Draft not found or not authorized" }, { status: 404 });
      }

      return NextResponse.json({ draft }, { status: 200 });
    }

    const { data: drafts, error } = await db
      .from("drafts")
      .select(`
        id,
        documentId,
        title,
        subtitle,
        author,
        createdAt,
        updatedAt,
        contentHtml,
        coverUrl
      `)
      .eq("author", address)
      .order("updatedAt", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ drafts }, { status: 200 });

  } catch (error) {
    if (error instanceof Error) {
      console.error("GET /api/drafts error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const { claims, error: authError } = verifyAuth(req);
    if (authError) {
      return authError;
    }

    const db = await createClient();
    const userAddress = claims.sub;

    if (!claims.metadata.isAnonymous) {
      const { address: actualUserAddress } = await getUserAccount();
      if (actualUserAddress !== userAddress) {
        return NextResponse.json({ error: "Invalid profile" }, { status: 401 });
      }
    }

    const body = await req.json();
    const documentId = body.documentId || getRandomUid();
    const contentJson = body.contentJson;
    const publishedId = body.publishedId || null;
    const yDocBase64 = body.yDocBase64; // Optional

    if (!contentJson) {
      return NextResponse.json({ error: "Missing contentJson" }, { status: 400 });
    }

    let yDocForDb = null;
    let isCollaborativeDb = false; // Renamed to avoid conflict with option name if ever in same scope

    if (yDocBase64) {
      const binaryData = Buffer.from(yDocBase64, "base64");
      yDocForDb = `\\x${binaryData.toString("hex")}`;
      isCollaborativeDb = true;
    }

    const { data, error } = await db
      .from("drafts")
      .insert({
        yDoc: yDocForDb,
        contentJson,
        documentId,
        author: address,
        published_id: publishedId,
        isCollaborative: isCollaborativeDb, // Use the new column
      })
      .select()
      .single();

    if (error) {
      console.error("DB insert error:", error);
      throw new Error(`DB insert error: ${error.message}`);
    }

    return NextResponse.json({ draft: data }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("POST /api/drafts error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const { claims, error: authError } = verifyAuth(req);
    if (authError) {
      return authError;
    }

    const db = await createClient();
    const address = claims.sub;

    if (!claims.metadata.isAnonymous) {
      const { address: lensAddress } = await getUserAccount();

      if (lensAddress !== address) {
        return NextResponse.json({ error: "Invalid profile" }, { status: 401 });
      }
    }

    const documentId = req.nextUrl.searchParams.get("id");
    if (!documentId) {
      return NextResponse.json({ error: "Missing draft ID" }, { status: 400 });
    }

    const body = await req.json();
    const {
      contentJson,
      title,
      subtitle,
      coverUrl,
      contentMarkdown
    } = body;

    // Check if at least one field to update is provided
    if (contentJson === undefined && title === undefined && subtitle === undefined && coverUrl === undefined && contentMarkdown === undefined) {
      return NextResponse.json({ error: "Missing content to update. At least one field (contentJson, title, etc.) must be provided." }, { status: 400 });
    }

    const updateData: { [key: string]: any } = {
      updatedAt: new Date().toISOString(),
    };

    if (contentJson !== undefined) {
      updateData.contentJson = contentJson;
    }
    if (title !== undefined) {
      updateData.title = title;
    }
    if (subtitle !== undefined) {
      updateData.subtitle = subtitle;
    }
    if (coverUrl !== undefined) {
      updateData.coverUrl = coverUrl;
    }
    if (contentMarkdown !== undefined) {
      updateData.contentMarkdown = contentMarkdown;
    }

    // This check is implicitly handled by the first check for undefined fields.
    // If all were undefined, it returns 400. If at least one is defined, updateData will have more than just updatedAt.
    // So, an explicit check for Object.keys(updateData).length === 1 might be redundant.

    const { data, error } = await db
      .from("drafts")
      .update(updateData)
      .match({ documentId, author: userAddress })
      .select()
      .single();

    if (error) {
      console.error("Error updating draft:", error.message);
      // Consider more specific error handling, e.g. P2025 for record not found by Prisma/Supabase
      throw new Error(`Error updating draft: ${error.message}`);
    }

    // data will be null if match fails (e.g. documentId not found or author mismatch)
    if (!data) {
      return NextResponse.json({ error: "Draft not found or not authorized for update" }, { status: 404 });
    }

    return NextResponse.json({ draft: data }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      console.error("PUT /api/drafts error:", error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { claims, error: authError } = verifyAuth(req);
    if (authError) {
      return authError;
    }

    const db = await createClient();
    const address = claims.sub;

    if (!claims.metadata.isAnonymous) {
      const { address: lensAddress } = await getUserAccount();

      if (lensAddress !== address) {
        return NextResponse.json({ error: "Invalid profile" }, { status: 401 });
      }
    }

    const documentId = req.nextUrl.searchParams.get("id");
    if (!documentId) {
      return NextResponse.json({ error: "Missing draft ID" }, { status: 400 });
    }

    const { data, error } = await db.from("drafts").delete().match({ documentId, author: address }).select().single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Draft deleted successfully" }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}

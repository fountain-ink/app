import { type NextRequest, NextResponse } from "next/server";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { verifyAuth } from "@/lib/auth/verify-auth-request";
import { createClient } from "@/lib/db/server";
import { getRandomUid } from "@/lib/get-random-uid";

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

    const documentId = req.nextUrl.searchParams.get("id");

    if (documentId) {
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
          contentJson,
          contentHtml,
          coverUrl
        `)
        .eq("documentId", documentId)
        .eq("author", address)
        .single();

      if (error) {
        throw new Error(error.message);
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
      console.error(error.message);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}

export async function POST(req: NextRequest) {
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

    const body = await req.json();
    const documentId = body.documentId || getRandomUid();
    const contentJson = body.contentJson;
    const publishedId = body.publishedId || null;

    if (!contentJson) {
      return NextResponse.json({ error: "Missing default content" }, { status: 400 });
    }

    let yDoc = null;
    if (body.yDocBase64) {
      const binaryData = Buffer.from(body.yDocBase64, "base64");
      yDoc = `\\x${binaryData.toString("hex")}`;
    }

    const { data, error } = await db
      .from("drafts")
      .insert({
        yDoc,
        contentJson,
        documentId,
        author: address,
        published_id: publishedId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return NextResponse.json({ draft: data }, { status: 201 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
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
    const { content, enableCollaboration, yDocBase64, title, subtitle, coverUrl } = body;

    if (!content && !enableCollaboration) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (title) {
      updateData.title = title;
    }

    if (subtitle) {
      updateData.subtitle = subtitle;
    }

    if (coverUrl) {
      updateData.coverUrl = coverUrl;
    }

    if (content) {
      updateData.contentJson = content;
    }

    if (enableCollaboration && yDocBase64) {
      const binaryData = Buffer.from(yDocBase64, "base64");
      updateData.yDoc = `\\x${binaryData.toString("hex")}`;
    }

    const { data, error } = await db
      .from("drafts")
      .update(updateData)
      .match({ documentId, author: address })
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ draft: data }, { status: 200 });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
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

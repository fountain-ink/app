import { env } from "@/env";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { verifyAuth } from "@/lib/auth/verify-auth-request";
import { getRandomUid } from "@/lib/get-random-uid";
import { createClient } from "@/lib/db/server";
import { defaultContent } from "@/lib/plate/default-content";
import { slateToDeterministicYjsState } from "@udecode/plate-yjs";
import * as Y from "yjs";
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
    const { content, enableCollaboration } = body;

    if (!content && !enableCollaboration) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const updateData: any = {
      updatedAt: new Date().toISOString(),
    };

    if (content) {
      updateData.contentJson = content;
    }

    if (enableCollaboration) {
      const { data: existingDraft, error: fetchError } = await db
        .from("drafts")
        .select("contentJson")
        .match({ documentId, author: address })
        .single();

      if (fetchError) {
        throw new Error(fetchError.message);
      }

      const draftContent = content || existingDraft?.contentJson || defaultContent;

      const yDoc = await generateYDoc(documentId, draftContent);
      const binary = Y.encodeStateAsUpdate(yDoc);
      updateData.yDoc = `\\x${Buffer.from(binary).toString("hex")}`;
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

async function generateYDoc(documentId: string, content: any) {
  const yDoc = new Y.Doc();
  const initialDelta = await slateToDeterministicYjsState(documentId, content);
  yDoc.transact(() => {
    Y.applyUpdate(yDoc, initialDelta);
  });
  return yDoc;
}

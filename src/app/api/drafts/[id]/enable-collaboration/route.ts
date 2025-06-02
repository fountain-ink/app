import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/db/server";
import { verifyAuth } from "@/lib/auth/verify-auth-request";
import { generateYDoc } from "@/lib/plate/create-draft";
import * as Y from "yjs";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { defaultContent } from "@/lib/plate/default-content"; // Import for fallback

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { claims, error: authError } = verifyAuth(req);
    if (authError) {
      return authError;
    }

    const documentId = params.id;
    if (!documentId) {
      return NextResponse.json({ error: "Document ID is required" }, { status: 400 });
    }

    const db = await createClient();
    const userAddress = claims.sub;

    if (!claims.metadata.isAnonymous) {
      const { address: actualUserAddress } = await getUserAccount();
      if (actualUserAddress !== userAddress) {
        return NextResponse.json({ error: "User mismatch" }, { status: 403 });
      }
    }

    const { data: currentDraft, error: fetchError } = await db
      .from("drafts")
      .select("contentJson, isCollaborative")
      .eq("documentId", documentId)
      .eq("author", userAddress)
      .single();

    if (fetchError) {
      console.error("Error fetching draft for collaboration enabling:", fetchError.message);
      return NextResponse.json({ error: "Failed to fetch draft: " + fetchError.message }, { status: 500 });
    }

    if (!currentDraft) {
      return NextResponse.json({ error: "Draft not found or not authorized" }, { status: 404 });
    }

    if (currentDraft.isCollaborative) {
      return NextResponse.json({ message: "Draft is already collaborative" }, { status: 200 });
    }

    const contentToUse = currentDraft.contentJson || defaultContent; // Use defaultContent if contentJson is null

    const yDoc = await generateYDoc(documentId, contentToUse);
    const yDocBinary = Y.encodeStateAsUpdate(yDoc);
    const yDocForDb = `\\x${yDocBinary.toString("hex")}`; // Correct format for bytea

    const { data: updatedDraft, error: updateError } = await db
      .from("drafts")
      .update({
        isCollaborative: true,
        yDoc: yDocForDb,
        updatedAt: new Date().toISOString(),
      })
      .eq("documentId", documentId)
      .eq("author", userAddress)
      .select("documentId, isCollaborative")
      .single();

    if (updateError) {
      console.error("Error updating draft to collaborative:", updateError.message);
      return NextResponse.json({ error: "Failed to update draft: " + updateError.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Collaboration enabled successfully",
      draft: updatedDraft
    }, { status: 200 });

  } catch (error) {
    console.error("Enable collaboration error:", error);
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "An unknown error occurred" }, { status: 500 });
  }
}

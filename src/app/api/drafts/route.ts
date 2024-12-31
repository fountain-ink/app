import { defaultContent } from "@/components/draft/draft-create-button";
import { createLensClient } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getAuthClaims } from "@/lib/auth/get-auth-claims";
import { getRandomUid } from "@/lib/get-random-uid";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const claims = getAuthClaims();
    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createClient();
    const tokenProfileId = claims.sub;

    // If not a guest user, verify with Lens
    if (!claims.user_metadata.isAnonymous) {
      const lens = await createLensClient();
      const { profileId: lensProfileId } = await getUserProfile(lens);
      
      if (lensProfileId !== tokenProfileId) {
        return NextResponse.json({ error: "Invalid profile" }, { status: 401 });
      }
    }

    const documentId = req.nextUrl.searchParams.get("id");

    if (documentId) {
      const { data: draft, error } = await db
        .from("drafts")
        .select()
        .eq("documentId", documentId)
        .eq("authorId", tokenProfileId)
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
      .select()
      .eq("authorId", tokenProfileId);

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
    const claims = getAuthClaims();
    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createClient();
    const tokenProfileId = claims.sub;

    // If not a guest user, verify with Lens
    if (!claims.user_metadata.isAnonymous) {
      const lens = await createLensClient();
      const { profileId: lensProfileId } = await getUserProfile(lens);
      
      if (lensProfileId !== tokenProfileId) {
        return NextResponse.json({ error: "Invalid profile" }, { status: 401 });
      }
    }

    const uid = getRandomUid();
    const documentId = `${uid}`;
    const contentJson = defaultContent;
    
    const { data, error } = await db
      .from("drafts")
      .insert({ contentJson, documentId, authorId: tokenProfileId })
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
    const claims = getAuthClaims();
    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createClient();
    const tokenProfileId = claims.sub;

    // If not a guest user, verify with Lens
    if (!claims.user_metadata.isAnonymous) {
      const lens = await createLensClient();
      const { profileId: lensProfileId } = await getUserProfile(lens);
      
      if (lensProfileId !== tokenProfileId) {
        return NextResponse.json({ error: "Invalid profile" }, { status: 401 });
      }
    }

    const documentId = req.nextUrl.searchParams.get("id");
    if (!documentId) {
      return NextResponse.json({ error: "Missing draft ID" }, { status: 400 });
    }

    const body = await req.json();
    const { content } = body;

    if (!content) {
      return NextResponse.json({ error: "Missing content" }, { status: 400 });
    }

    const updateData = {
      updatedAt: new Date().toISOString(),
      contentJson: content,
    };

    const { data, error } = await db
      .from("drafts")
      .update(updateData)
      .match({ documentId, authorId: tokenProfileId })
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
    const claims = getAuthClaims();
    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createClient();
    const tokenProfileId = claims.sub;

    // If not a guest user, verify with Lens
    if (!claims.user_metadata.isAnonymous) {
      const lens = await createLensClient();
      const { profileId: lensProfileId } = await getUserProfile(lens);
      
      if (lensProfileId !== tokenProfileId) {
        return NextResponse.json({ error: "Invalid profile" }, { status: 401 });
      }
    }

    const documentId = req.nextUrl.searchParams.get("id");
    if (!documentId) {
      return NextResponse.json({ error: "Missing draft ID" }, { status: 400 });
    }

    const { data, error } = await db
      .from("drafts")
      .delete()
      .match({ documentId, authorId: tokenProfileId })
      .select()
      .single();

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

import { defaultContent } from "@/components/draft/draft-create-button";
import { env } from "@/env";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { verifyToken } from "@/lib/auth/verify-token";
import { getRandomUid } from "@/lib/get-random-uid";
import { getLensClient } from "@/lib/lens/client";
import { createClient } from "@/lib/supabase/server";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const appToken = req.cookies.get("appToken")?.value;
    const verified = verifyToken(appToken, env.SUPABASE_JWT_SECRET);
    if (!appToken || !verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(appToken);
    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createClient();
    const address = claims.sub;

    // If not a guest user, verify with Lens
    if (!claims.metadata.isAnonymous) {
      const lens = await getLensClient();
      const { address: userAddress } = await getUserProfile();

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
          contentHtml
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
        contentHtml
      `)
      .eq("author", address);

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
    const appToken = req.cookies.get("appToken")?.value;
    const verified = verifyToken(appToken, env.SUPABASE_JWT_SECRET);
    if (!appToken || !verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(appToken);
    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createClient();
    const address = claims.sub;

    // If not a guest user, verify with Lens
    if (!claims.metadata.isAnonymous) {
      const lens = await getLensClient();
      const { address: lensAddress } = await getUserProfile();

      if (lensAddress !== address) {
        return NextResponse.json({ error: "Invalid profile" }, { status: 401 });
      }
    }

    const body = await req.json();
    const documentId = body.documentId || getRandomUid();
    const contentJson = defaultContent;

    const { data, error } = await db
      .from("drafts")
      .insert({ contentJson, documentId, author: address })
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
    const appToken = req.cookies.get("appToken")?.value;
    const verified = verifyToken(appToken, env.SUPABASE_JWT_SECRET);
    if (!appToken || !verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(appToken);
    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createClient();
    const address = claims.sub;

    // If not a guest user, verify with Lens
    if (!claims.metadata.isAnonymous) {
      const lens = await getLensClient();
      const { address: lensAddress } = await getUserProfile();

      if (lensAddress !== address) {
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
    const appToken = req.cookies.get("appToken")?.value;
    const verified = verifyToken(appToken, env.SUPABASE_JWT_SECRET);
    if (!appToken || !verified) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(appToken);
    if (!claims) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const db = await createClient();
    const address = claims.sub;

    // If not a guest user, verify with Lens
    if (!claims.metadata.isAnonymous) {
      const lens = await getLensClient();
      const { address: lensAddress } = await getUserProfile();

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

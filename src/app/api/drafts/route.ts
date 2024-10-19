import { getAuthorizedClients } from "@/lib/get-auth-clients";
import { getRandomUid } from "@/lib/get-random-uid";
import { type NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  try {
    const { profileId, db } = await getAuthorizedClients();

    if (!db) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documentId = req.nextUrl.searchParams.get("id");

    if (documentId) {
      const { data: draft, error } = await db
        .from("drafts")
        .select()
        .eq("documentId", documentId)
        .eq("authorId", profileId)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!draft) {
        return NextResponse.json({ error: "Draft not found or not authorized" }, { status: 404 });
      }

      return NextResponse.json({ draft }, { status: 200 });
    }

    const { data: drafts, error } = await db.from("drafts").select().eq("authorId", profileId);

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

export async function POST() {
  try {
    const { profileId, db, handle } = await getAuthorizedClients();
    if (!db) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const uid = getRandomUid();
    const documentId = `${handle}-${uid}`;

    const contentJson = {
      "type": "doc",
      "content": [
        {
          "type": "title",
          "attrs": {
            "level": 1
          }
        },
        {
          "type": "subtitle",
          "attrs": {
            "level": 2
          }
        },
        {
          "type": "image",
          "attrs": {
            "src": null,
            "width": "wide"
          }
        }
      ]
    }
      
    const { data, error } = await db
      .from("drafts")
      .insert({ contentJson, documentId, authorId: profileId })
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
    const { profileId, db } = await getAuthorizedClients();

    const documentId = req.nextUrl.searchParams.get("id");

    if (!documentId) {
      return NextResponse.json({ error: "Missing draft ID" }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
      .match({ documentId, authorId: profileId })
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
      console.error(error);

      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { profileId, db } = await getAuthorizedClients();

    if (!db) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const documentId = req.nextUrl.searchParams.get("id");

    if (!documentId) {
      return NextResponse.json({ error: "Missing draft ID" }, { status: 400 });
    }

    const { data, error } = await db
      .from("drafts")
      .delete()
      .match({ documentId, authorId: profileId })
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

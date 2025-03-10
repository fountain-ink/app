import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { isEvmAddress } from "@/lib/utils/address";

async function findBlogByIdentifier(db: any, identifier: string) {
  if (isEvmAddress(identifier)) {
    return await db
      .from("blogs")
      .select("*")
      .eq("address", identifier)
      .single();
  } else {
    return await db
      .from("blogs")
      .select("*")
      .eq("handle", identifier)
      .single();
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: { blog: string } }
) {
  try {
    const token = req.cookies.get("appToken")?.value;
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(token);
    if (!claims?.metadata?.address) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const { settings } = await req.json();
    if (!settings) {
      return NextResponse.json({ error: "No settings provided" }, { status: 400 });
    }

    const db = await createClient();

    const { data: blog, error: findError } = await findBlogByIdentifier(db, params.blog);

    if (findError) {
      console.error("Error finding blog:", findError);
      return NextResponse.json({ error: "Failed to find blog" }, { status: 500 });
    }

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Check if the user owns the blog
    if (blog.owner !== claims.metadata.address) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const blogData = {
      address: blog.address, // Use the existing address
      title: settings.title,
      about: settings.about,
      handle: settings.handle,
      metadata: {
        showAuthor: settings.metadata?.showAuthor ?? true,
        showTags: settings.metadata?.showTags ?? true,
        showTitle: settings.metadata?.showTitle ?? true,
      },
      theme: settings.theme,
      icon: settings.icon,
      updated_at: new Date().toISOString(),
      owner: claims.metadata.address,
    };

    const { error } = await db
      .from("blogs")
      .update(blogData)
      .eq("address", blog.address);

    if (error) {
      console.error("Error updating blog settings:", error);
      return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in blog settings update:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update settings" },
      { status: 500 },
    );
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { blog: string } }
) {
  try {
    // Always require authentication for this route
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
    
    // Find the blog by identifier (address or handle)
    const { data: blog, error } = await findBlogByIdentifier(db, params.blog);

    if (error) {
      console.error("Error fetching blog settings:", error);
      return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
    }

    if (!blog) {
      return NextResponse.json({ error: "Blog not found" }, { status: 404 });
    }

    // Check if the user has permission to access this blog's settings
    // For now, only the owner can access the full settings
    if (blog.owner !== userAddress) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    return NextResponse.json(blog);
  } catch (error) {
    console.error("Error in blog settings fetch:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to fetch settings" },
      { status: 500 },
    );
  }
}

export const dynamic = "force-dynamic"; 
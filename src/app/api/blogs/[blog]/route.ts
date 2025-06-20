import { fetchGroup } from "@lens-protocol/client/actions";
import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth/verify-auth-request";
import { createClient } from "@/lib/db/server";
import { getLensClient } from "@/lib/lens/client";
import { isEvmAddress } from "@/lib/utils/is-evm-address";

async function findBlogByIdentifier(db: any, identifier: string) {
  if (isEvmAddress(identifier)) {
    return await db.from("blogs").select("*").eq("address", identifier).single();
  }
  return await db.from("blogs").select("*").eq("handle", identifier).single();
}

export async function POST(req: NextRequest, { params }: { params: { blog: string } }) {
  console.log(`[Blog Create] Creating blog record for: ${params.blog}`);

  try {
    const { claims, error: authError } = verifyAuth(req);
    if (authError) {
      console.log("[Blog Create] No auth token found or invalid token");
      return authError;
    }

    const userAddress = claims.metadata.address;
    const handle = claims.metadata.username;
    console.log(`[Blog Create] User authenticated: ${userAddress}`);

    const { settings } = await req.json();
    if (!settings) {
      console.log("[Blog Create] No settings provided");
      return NextResponse.json({ error: "No settings provided" }, { status: 400 });
    }

    // Verify the blog address is valid
    if (!isEvmAddress(params.blog)) {
      console.log(`[Blog Create] Invalid address format: ${params.blog}`);
      return NextResponse.json({ error: "Invalid blog address format" }, { status: 400 });
    }

    // Fetch group from Lens to verify ownership
    const lensClient = await getLensClient();
    const groupResult = await fetchGroup(lensClient, { group: params.blog });

    if (groupResult.isErr()) {
      console.error("[Blog Create] Error fetching group from Lens:", groupResult.error);
      return NextResponse.json({ error: "Failed to verify blog ownership" }, { status: 500 });
    }

    const group = groupResult.value;

    if (!group) {
      console.log(`[Blog Create] Group not found for address: ${params.blog}`);
      return NextResponse.json({ error: "Blog group not found on Lens" }, { status: 404 });
    }

    if (!group.owner) {
      console.log(`[Blog Create] Group owner not found for address: ${params.blog}`);
      return NextResponse.json({ error: "Blog group owner not found on Lens" }, { status: 404 });
    }

    if (group.owner !== userAddress) {
      console.log(`[Blog Create] Auth mismatch: group owner ${group.owner} != authenticated user ${userAddress}`);
      return NextResponse.json({ error: "Unauthorized - you are not the owner of this blog" }, { status: 403 });
    }

    const db = await createClient();

    const { data: existingBlog } = await db.from("blogs").select("*").eq("address", params.blog).single();

    if (existingBlog) {
      console.log(`[Blog Create] Blog with address ${params.blog} already exists`);
      return NextResponse.json({ error: "Blog already exists" }, { status: 409 });
    }

    const blogData = {
      address: params.blog,
      title: settings.title,
      about: settings.about || "",
      handle: handle || "",
      slug: settings.slug || "",
      metadata: {
        showAuthor: true,
        showTags: true,
        showTitle: true,
        ...(settings.metadata || {}),
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      owner: userAddress,
    };

    // Insert new blog record
    const { error: dbError } = await db.from("blogs").insert(blogData);

    if (dbError) {
      console.error("[Blog Create] Error creating blog:", dbError);
      return NextResponse.json({ error: "Failed to create blog" }, { status: 500 });
    }

    console.log(`[Blog Create] Successfully created blog with address ${params.blog}`);
    return NextResponse.json({ success: true, address: params.blog });
  } catch (error) {
    console.error("[Blog Create] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create blog" },
      { status: 500 },
    );
  }
}

export async function PUT(req: NextRequest, { params }: { params: { blog: string } }) {
  try {
    const { claims, error: authError } = verifyAuth(req);
    if (authError) {
      return authError;
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
      slug: settings.slug,
      metadata: {
        showAuthor: settings.metadata?.showAuthor ?? true,
        showTags: settings.metadata?.showTags ?? true,
        showTitle: settings.metadata?.showTitle ?? true,
        ...(blog.metadata || {}),
        ...(settings.metadata || {}),
      },
      theme: settings.theme,
      icon: settings.icon,
      updated_at: new Date().toISOString(),
      owner: claims.metadata.address,
    };

    const { error: dbError } = await db.from("blogs").update(blogData).eq("address", blog.address);

    if (dbError) {
      console.error("Error updating blog settings:", dbError);
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

export async function GET(req: NextRequest, { params }: { params: { blog: string } }) {
  try {
    // Always require authentication for this route
    const { claims, error: authError } = verifyAuth(req);
    if (authError) {
      return authError;
    }

    const userAddress = claims.metadata.address;

    const db = await createClient();

    // Find the blog by identifier (address or handle)
    const { data: blog, error: dbError } = await findBlogByIdentifier(db, params.blog);

    if (dbError) {
      console.error("Error fetching blog settings:", dbError);
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

import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { createClient } from "@/lib/db/server";
import { getLensClient } from "@/lib/lens/client";
import { fetchGroups } from "@lens-protocol/client/actions";
import { evmAddress } from "@lens-protocol/client";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  console.log("[Blogs Sync] Starting sync process");

  try {
    const token = req.cookies.get("appToken")?.value;
    if (!token) {
      console.log("[Blogs Sync] No auth token found");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const claims = getTokenClaims(token);
    if (!claims?.metadata?.address) {
      console.log("[Blogs Sync] Invalid token claims");
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const userAddress = claims.metadata.address;
    const username = claims.metadata.username;
    console.log(`[Blogs Sync] User authenticated: ${userAddress}, ${username}`);

    const db = await createClient();

    console.log(`[Blogs Sync] Checking for personal blog: ${userAddress}`);
    const { data: personalBlog } = await db
      .from("blogs")
      .select("*")
      .eq("address", userAddress)
      .eq("owner", userAddress)
      .single();

    if (!personalBlog) {
      console.log("[Blogs Sync] Personal blog not found, creating one");
      await db.from("blogs").insert({
        address: userAddress,
        title: `${username}'s Blog`,
        about: `${username}'s personal blog on Fountain`,
        owner: userAddress,
        handle: username,
      });
      console.log(`[Blogs Sync] Personal blog created for: ${userAddress}`);
    } else {
      console.log(`[Blogs Sync] Personal blog already exists for: ${userAddress}`);
    }

    console.log("[Blogs Sync] Starting on-chain sync process");
    const client = await getLensClient();
    if (!client.isSessionClient()) {
      console.log("[Blogs Sync] Lens client not initialized");
      return NextResponse.json({ error: "Login to sync blogs" }, { status: 500 });
    }

    const user = client.getAuthenticatedUser();
    if (user.isErr()) {
      console.log("[Blogs Sync] Failed to get authenticated Lens user");
      return NextResponse.json({ error: "Failed to get authenticated user" }, { status: 500 });
    }
    console.log(`[Blogs Sync] Lens user authenticated: ${user.value.address}`);

    const result = await fetchGroups(client, {
      filter: {
        // member: evmAddress(user.value.address),
        managedBy: {
          includeOwners: true,
          address: evmAddress(user.value.address),
        },
      },
    });

    if (result.isErr()) {
      console.log("[Blogs Sync] Failed to fetch on-chain blogs: ", result.error);
      return NextResponse.json({ error: "Failed to fetch on-chain blogs" }, { status: 500 });
    }

    const onChainBlogs = result.value.items;
    console.log(`[Blogs Sync] Found ${onChainBlogs.length} on-chain blogs`);

    const { data: existingBlogs } = await db
      .from("blogs")
      .select("*")
      .in(
        "address",
        onChainBlogs.map((blog) => blog.address),
      );

    console.log(`[Blogs Sync] Found ${existingBlogs?.length || 0} existing blogs in database`);

    const existingBlogsMap = new Map();
    existingBlogs?.forEach((blog) => {
      existingBlogsMap.set(blog.address, blog);
    });

    const operations = onChainBlogs.map((blog) => {
      const existingBlog = existingBlogsMap.get(blog.address);

      if (!existingBlog) {
        console.log(`[Blogs Sync] Preparing to create blog: ${blog.address}`);
        return db
          .from("blogs")
          .insert({
            address: blog.address,
            title: blog.metadata?.name || "Untitled Blog",
            feed: blog.feed?.address || null,
            about: blog.metadata?.description || null,
            icon: blog.metadata?.icon || null,
            owner: userAddress,
          })
          .then(() => {
            console.log(`[Blogs Sync] Blog created: ${blog.address}`);
          });
      }
      console.log(`[Blogs Sync] Blog exists in DB: ${blog.address}`);
      const updates = {
        title: existingBlog.title ?? blog.metadata?.name,
        feed: blog.feed?.address || null,
        owner: blog.owner,
        about: existingBlog.about ?? blog.metadata?.description,
        icon: existingBlog.icon ?? blog.metadata?.icon,
      };

      if (Object.values(updates).some((v) => v !== undefined)) {
        console.log(`[Blogs Sync] Preparing to update blog: ${blog.address}`);
        return db
          .from("blogs")
          .update(updates)
          .eq("address", blog.address)
          .then(() => {
            console.log(`[Blogs Sync] Blog updated: ${blog.address}`);
          });
      }
      console.log(`[Blogs Sync] No updates needed for: ${blog.address}`);
      return Promise.resolve(); // No operation needed
    });

    console.log(`[Blogs Sync] Executing ${operations.length} operations in parallel`);
    await Promise.all(operations);
    console.log("[Blogs Sync] All operations completed");

    console.log(`[Blogs Sync] Fetching blogs for user: ${userAddress}`);
    const { data: userBlogs, error } = await db.from("blogs").select("*").eq("owner", userAddress);

    if (error) {
      console.error("[Blogs Sync] Error fetching user blogs:", error);
      return NextResponse.json({ error: "Failed to fetch blogs" }, { status: 500 });
    }

    console.log(`[Blogs Sync] Updated ${userBlogs?.length || 0} blogs in database`);
    return NextResponse.json({
      blogs: userBlogs || [],
    });
  } catch (error) {
    console.error("[Blogs Sync] Unexpected error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sync/fetch blogs" },
      { status: 500 },
    );
  }
}

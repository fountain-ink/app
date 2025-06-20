import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth/verify-auth-request";
import { createClient } from "@/lib/db/server";
import { findBlogByIdentifier } from "@/lib/utils/find-blog-by-id";

export async function getVerifiedBlog(req: NextRequest, identifier: string) {
  const { claims, error } = verifyAuth(req);
  if (error) {
    return { error };
  }

  const db = await createClient();
  const { data: blog, error: dbError } = await findBlogByIdentifier(db, identifier);

  if (dbError || !blog) {
    console.error("Error fetching blog data:", dbError);
    return { error: NextResponse.json({ error: "Blog not found" }, { status: 404 }) };
  }

  if (blog.owner !== claims.metadata.address) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 403 }) };
  }

  return { db, blog, userAddress: claims.metadata.address };
}

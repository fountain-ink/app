import type { AnyPost } from "@lens-protocol/client";
import { createServiceClient } from "@/lib/db/service";

export async function getBannedAddresses(): Promise<string[]> {
  const supabase = await createServiceClient();

  const { data, error } = await supabase.from("banlist").select("address");

  if (error) {
    console.error("Error fetching banned addresses:", error);
    return [];
  }

  return data?.map((row) => row.address.toLowerCase()) || [];
}

export function filterBannedPosts(posts: AnyPost[], bannedAddresses: string[]): AnyPost[] {
  if (bannedAddresses.length === 0) return posts;

  const bannedSet = new Set(bannedAddresses.map((addr) => addr.toLowerCase()));

  return posts.filter((post) => {
    if (post.__typename !== "Post") return true;
    const authorAddress = post.author.address.toLowerCase();
    return !bannedSet.has(authorAddress);
  });
}

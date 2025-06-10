import { createServiceClient } from "@/lib/db/service";
import { getLensClient } from "@/lib/lens/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import type { AnyPost, PostId } from "@lens-protocol/client";

export interface CuratedData {
  posts: AnyPost[];
  hasMore: boolean;
  page: number;
}

export async function fetchCuratedPosts(page = 1, limit = 10): Promise<CuratedData> {
  const supabase = await createServiceClient();
  const offset = (page - 1) * limit;

  // Get total count and curated post IDs from database
  const {
    data: curatedItems,
    error,
    count,
  } = await supabase
    .from("curated")
    .select("slug, created_at", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error("Error fetching curated items:", error);
    return { posts: [], hasMore: false, page };
  }

  console.log("Curated items from DB:", curatedItems);

  const totalCount = count || 0;
  const hasMore = totalCount > offset + limit;
  // The 'slug' field in curated table actually contains Lens post IDs
  const postIds = (curatedItems || []).map((item) => item.slug).filter((slug): slug is string => slug !== null);

  console.log("Post IDs from curated table:", postIds);

  if (postIds.length === 0) {
    console.log("No post IDs found in curated table");
    return { posts: [], hasMore: false, page };
  }

  // Fetch full post data from Lens
  const lens = await getLensClient();
  const result = await fetchPosts(lens, {
    filter: { posts: postIds as PostId[] },
  });

  if (result.isOk()) {
    console.log("Lens API returned posts:", result.value.items.length);

    // Create a map of Lens post ID to post
    const postsMap = new Map(result.value.items.map((post) => [post.id, post]));

    // Order posts according to the original ID order from curated table
    const orderedPosts = postIds
      .map((id) => postsMap.get(id as PostId))
      .filter((post): post is AnyPost => post !== undefined);

    console.log("Ordered posts after mapping:", orderedPosts.length);
    return { posts: orderedPosts, hasMore, page };
  }

  console.error("Failed to fetch curated posts:", result.error);
  return { posts: [], hasMore: false, page };
}

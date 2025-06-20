import type { AnyPost, PostId } from "@lens-protocol/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { CuratedFeed } from "@/components/feed/feed-curated";
import { FeedLayout } from "@/components/navigation/feed-layout";
import { createServiceClient } from "@/lib/db/service";
import { getLensClient } from "@/lib/lens/client";

export async function generateMetadata() {
  return {
    title: "Curated | Fountain",
    description: "Discover curated articles on Fountain",
    openGraph: {
      title: "Curated | Fountain",
      description: "Discover curated articles on Fountain",
    },
    twitter: {
      card: "summary",
      title: "Curated | Fountain",
      description: "Discover curated articles on Fountain",
    },
  };
}

const CuratedPage = async () => {
  try {
    // Fetch curated post IDs from database
    const supabase = await createServiceClient();
    const { data: curatedData, error } = await supabase
      .from("curated")
      .select("slug")
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      console.error("Error fetching curated posts:", error);
      return (
        <FeedLayout>
          <CuratedFeed initialPosts={[]} hasMore={false} page={1} preFilteredPosts={true} />
        </FeedLayout>
      );
    }

    const postIds = curatedData?.map((item) => item.slug).filter(Boolean) || [];
    let posts: AnyPost[] = [];
    if (postIds.length > 0) {
      const lens = await getLensClient();
      const postsResult = await fetchPosts(lens, { filter: { posts: postIds as PostId[] } });

      if (postsResult.isOk()) {
        posts = [...postsResult.value.items];
      }
    }

    const { count } = await supabase.from("curated").select("*", { count: "exact", head: true });

    const hasMore = (count || 0) > 10;

    return (
      <FeedLayout>
        <CuratedFeed initialPosts={posts} hasMore={hasMore} page={1} preFilteredPosts={true} />
      </FeedLayout>
    );
  } catch (error) {
    console.error("Unexpected error in CuratedPage:", error);
    return (
      <FeedLayout>
        <CuratedFeed initialPosts={[]} hasMore={false} page={1} preFilteredPosts={true} />
      </FeedLayout>
    );
  }
};

export default CuratedPage;

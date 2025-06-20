import type { AnyPost, PostId } from "@lens-protocol/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { LandingPageClient } from "@/components/misc/landing-page";
import { createServiceClient } from "@/lib/db/service";
import { getLensClient } from "@/lib/lens/client";

export default async function HomePage() {
  let favoritePosts: AnyPost[] = [];

  try {
    const supabase = await createServiceClient();
    const { data: curatedData } = await supabase
      .from("curated")
      .select("slug")
      .order("created_at", { ascending: false })
      .limit(9);

    const postIds = curatedData?.map((item) => item.slug).filter(Boolean) || [];

    if (postIds.length > 0) {
      const lens = await getLensClient();
      const postsResult = await fetchPosts(lens, { filter: { posts: postIds as PostId[] } });

      if (postsResult.isOk()) {
        favoritePosts = [...postsResult.value.items];
      }
    }
  } catch (error) {
    console.error("Error fetching favorites:", error);
  }

  return <LandingPageClient favoritePosts={favoritePosts} />;
}

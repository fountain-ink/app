import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { MainContentFocus, AnyPost } from "@lens-protocol/client";
import { env } from "@/env";
import { PaginatedArticleFeed } from "@/components/post/post-paginated-feed";
import { FeedNavigation } from "@/components/navigation/feed-navigation";

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
  const lens = await getLensClient();
  const { address: userAddress } = await getUserProfile();

  const postsResult = await fetchPosts(lens, {
    filter: {
      accountScore: {
        atLeast: 9800, 
      },
      metadata: { mainContentFocus: [MainContentFocus.Article] },
      feeds: [{ globalFeed: true }],
      apps: [env.NEXT_PUBLIC_APP_ADDRESS],
    },
  }).unwrapOr(null);

  const mutablePosts: AnyPost[] = postsResult?.items ? [...postsResult.items] : [];

  return (
    <div className="flex flex-col mt-5 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
      <FeedNavigation />

      <div className="flex flex-col my-4 items-center w-full">
        <PaginatedArticleFeed
          initialPosts={mutablePosts}
          initialPaginationInfo={postsResult?.pageInfo ?? {}}
          isUserProfile={false}
        />
      </div>
    </div>
  );
};

export default CuratedPage; 
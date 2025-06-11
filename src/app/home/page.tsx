import { getLensClient } from "@/lib/lens/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { MainContentFocus, AnyPost } from "@lens-protocol/client";
import { env } from "@/env";
import { LatestFeed } from "@/components/feed/feed-latest";
import { FeedLayout } from "@/components/navigation/feed-layout";
import { getBannedAddresses, filterBannedPosts } from "@/lib/utils/ban-filter";

export async function generateMetadata() {
  return {
    title: "Fountain",
    description: "Discover the latest articles on Fountain",
    openGraph: {
      title: "Fountain",
      description: "Discover the latest articles on Fountain",
    },
    twitter: {
      card: "summary",
      title: "Fountain",
      description: "Discover the latest articles on Fountain",
    },
  };
}

const home = async () => {
  const lens = await getLensClient();

  // Fetch posts and banned addresses in parallel
  const [postsResult, bannedAddresses] = await Promise.all([
    fetchPosts(lens, {
      filter: {
        metadata: { mainContentFocus: [MainContentFocus.Article] },
        feeds: [{ globalFeed: true }],
        apps: [env.NEXT_PUBLIC_APP_ADDRESS],
      },
    }).unwrapOr(null),
    getBannedAddresses()
  ]);

  const allPosts: AnyPost[] = postsResult?.items ? [...postsResult.items] : [];
  const filteredPosts = filterBannedPosts(allPosts, bannedAddresses);
  const pageInfo = postsResult?.pageInfo || (postsResult?.items?.length ? { next: "initial" } : {});

  return (
    <FeedLayout>
      <LatestFeed
        initialPosts={filteredPosts}
        initialPaginationInfo={pageInfo}
        isUserProfile={false}
        preFilteredPosts={true}
      />
    </FeedLayout>
  );
};

export default home;

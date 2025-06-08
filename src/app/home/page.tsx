import { getLensClient } from "@/lib/lens/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { MainContentFocus, AnyPost } from "@lens-protocol/client";
import { env } from "@/env";
import { PostFeedWithToggle } from "@/components/post/post-feed-with-toggle";
import { FeedNavigation } from "@/components/navigation/feed-navigation";

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

  const postsResult = await fetchPosts(lens, {
    filter: {
      metadata: { mainContentFocus: [MainContentFocus.Article] },
      feeds: [{ globalFeed: true }],
      apps: [env.NEXT_PUBLIC_APP_ADDRESS],
    },
  }).unwrapOr(null);

  const mutablePosts: AnyPost[] = postsResult?.items ? [...postsResult.items] : [];

  return (
    <div className="flex flex-col mt-5 items-center justify-center w-full">
      <div className="w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
        <FeedNavigation />
      </div>

      <div className="flex flex-col items-center w-full">
        <PostFeedWithToggle
          feedType="latest"
          initialPosts={mutablePosts}
          initialPaginationInfo={postsResult?.pageInfo ?? {}}
          isUserProfile={false}
        />
      </div>
    </div>
  );
};

export default home;

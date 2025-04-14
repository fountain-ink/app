import { Separator } from "@/components/ui/separator";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { MainContentFocus, AnyPost } from "@lens-protocol/client";
import { env } from "@/env";
import { PaginatedArticleFeed } from "@/components/post/post-paginated-feed";

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

const FeedPage = async () => {
  const lens = await getLensClient();
  const { address: userAddress } = await getUserProfile();

  const postsResult = await fetchPosts(lens, {
    filter: {
      metadata: { mainContentFocus: [MainContentFocus.Article] },
      feeds: [{ globalFeed: true }],
      apps: [env.NEXT_PUBLIC_APP_ADDRESS],
    },
  }).unwrapOr(null);

  const mutablePosts: AnyPost[] = postsResult?.items ? [...postsResult.items] : [];

  return (
    <div className="flex flex-col mt-5 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
      <div
        className="font-[family-name:var(--title-font)] text-[1.5rem] sm:text-[2rem] lg:text-[2.5rem] text-center font-normal overflow-hidden line-clamp-2 mb-6"
      >
        Home
      </div>

      <Separator className="w-64 bg-primary mt-1" />

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

export default FeedPage; 
import { Separator } from "@/components/ui/separator";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { MainContentFocus, AnyPost } from "@lens-protocol/client";
import { env } from "@/env";
import { LatestArticleFeed } from "@/components/post/post-paginated-feed";

export const metadata = {
  title: "Latest Posts | Admin Portal",
  description: "View and manage the latest posts on Fountain",
};

const LatestPostsPage = async () => {
  const lens = await getLensClient();
  const { address: userAddress } = await getUserAccount();

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
      <div className="font-bold text-2xl mb-6">Latest Posts</div>

      <Separator className="w-64 bg-primary mt-1 mb-8" />

      <div className="flex flex-col my-4 items-center w-full">
        <LatestArticleFeed
          initialPosts={mutablePosts}
          initialPaginationInfo={postsResult?.pageInfo ?? {}}
          isUserProfile={false}
        />
      </div>
    </div>
  );
};

export default LatestPostsPage;

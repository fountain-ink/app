import { Separator } from "@/components/ui/separator";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { MainContentFocus, AnyPost } from "@lens-protocol/client";
import { env } from "@/env";
import { CuratedPaginatedFeed } from "@/components/admin/admin-feed";

export const metadata = {
  title: "Curate Posts | Admin Portal",
  description: "Curate and manage published posts on Fountain",
};

const CuratePage = async () => {
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
    <div className="flex flex-col mt-5 items-center justify-center max-w-4xl">
       <div className="font-bold text-2xl mb-2 w-full">
        Curate Posts
      </div>
      <p className="text-muted-foreground mb-6 w-full">
        Add or remove posts from the curated list, or ban post authors.
      </p>

      <Separator className="w-full bg-border mb-8" />

      <div className="flex flex-col items-center">
        <CuratedPaginatedFeed
          initialPosts={mutablePosts}
          initialPaginationInfo={postsResult?.pageInfo ?? {}}
        />
      </div>
    </div>
  );
};

export default CuratePage; 
import { ArticleFeed } from "@/components/post/post-article-feed";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { evmAddress, MainContentFocus } from "@lens-protocol/client";
import { fetchAccount, fetchPosts } from "@lens-protocol/client/actions";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { address } = await getUserAccount();
  const localName = params.user.toLowerCase();
  const account = await fetchAccount(lens, { username: { localName } }).unwrapOr(null);

  const posts = await fetchPosts(lens, {
    filter: {
      authors: [evmAddress(account?.address)],
      metadata: { mainContentFocus: [MainContentFocus.Article] },
    },
  })

  if (posts.isErr()) {
    console.error(posts.error);
    return null;
  }

  const isUserProfile = address === account?.address;

  return (
    <ArticleFeed
      posts={[...posts.value.items]}
      isUserProfile={isUserProfile}
    />
  );
};

export default UserPage;

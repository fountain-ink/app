import { UserContent } from "@/components/user/user-content";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { evmAddress, MainContentFocus } from "@lens-protocol/client";
import { fetchAccount, fetchPosts } from "@lens-protocol/client/actions";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { address } = await getUserProfile();
  const account = await fetchAccount(lens, { username: { localName: params.user } }).unwrapOr(null);
  const appEvmAddress = "0xFDa2276FCC1Ad91F45c98cB88248a492a0d285e2";

  const posts = await fetchPosts(lens, {
    filter: {
      // apps: [appEvmAddress],
      authors: [evmAddress(account?.address)],
      metadata: { mainContentFocus: [MainContentFocus.Article] },
    },
  })
  if (posts.isErr()) {
    console.error(posts.error);
    return null;
  }

  if (!account || !posts) {
    return null;
  }

  const isUserProfile = address === account.address;

  return (
    <UserContent posts={[...posts.value.items]} isUserProfile={isUserProfile} contentType="articles" profile={account} />
  );
};

export default UserPage;

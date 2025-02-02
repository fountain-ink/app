import { UserContent } from "@/components/user/user-content";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { MainContentFocus } from "@lens-protocol/client";
import { fetchAccount, fetchPosts } from "@lens-protocol/client/actions";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { address } = await getUserProfile();
  const profile = await fetchAccount(lens, { username: { localName: params.user } }).unwrapOr(null);
  const appEvmAddress = "0xF9F360bb2bFA920a19cB5DedFd4d2d9e7ecc5904";

  const posts = await fetchPosts(lens, {
    filter: {
      // apps: [appEvmAddress],
      authors: [profile?.address],
      metadata: { mainContentFocus: [MainContentFocus.Article] },
    },
  }).unwrapOr(null);

  if (!profile || !posts) {
    return null;
  }

  const isUserProfile = address === profile.address;

  return (
    <UserContent posts={[...posts.items]} isUserProfile={isUserProfile} contentType="articles" profile={profile} />
  );
};

export default UserPage;

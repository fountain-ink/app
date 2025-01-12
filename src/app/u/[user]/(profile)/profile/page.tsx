import { UserContent } from "@/components/user/user-content";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount, fetchPosts } from "@lens-protocol/client/actions";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { profileId, handle: userHandle } = await getUserProfile();
  const pageHandle = `lens/${params.user}`;
  const profile = await fetchAccount(lens, { username: { localName: params.user } }).unwrapOr(null);
  const appEvmAddress = "0xF9F360bb2bFA920a19cB5DedFd4d2d9e7ecc5904";

  const publications = await fetchPosts(lens, {
    filter: {
      // apps: [appEvmAddress],
      authors: [profile?.address],
    },
  });

  if (!profile) {
    return null;
  }

  const isUserProfile = profileId === profile.address;
  return <UserContent isUserProfile={isUserProfile} contentType="articles" profile={profile} />;
};

export default UserPage;

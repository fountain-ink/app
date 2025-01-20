import ErrorPage from "@/components/misc/error-page";
import { UserContent } from "@/components/user/user-content";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount, fetchPosts } from "@lens-protocol/client/actions";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { address } = await getUserProfile();

  const profile = await fetchAccount(lens, { username: { localName: params.user } }).unwrapOr(null);
  const posts = await fetchPosts(lens, {
    filter: {
      // apps: [appEvmAddress],
      authors: [profile?.address],
    },
  }).unwrapOr(null);

  if (!profile || !posts) {
    return <ErrorPage error="User not found" />;
  }

  const isUserProfile = address === profile.address;

  return (
    <div className="flex flex-col p-4">
      <UserContent posts={[...posts.items]} contentType="all" profile={profile} isUserProfile={isUserProfile} />
    </div>
  );
};

export default UserPage;

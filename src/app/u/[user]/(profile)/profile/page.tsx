import { UserContent } from "@/components/user/user-content";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { profileId, handle: userHandle } = await getUserProfile();
  const pageHandle = `lens/${params.user}`;
  const profile = await fetchAccount(lens, {});

  if (!profile) {
    return null;
  }

  if (profile.isErr()) {
    console.error("Failed to fetch user profile");
    return null;
  }

  const isUserProfile = profileId === profile.value?.address;
  return <UserContent isUserProfile={isUserProfile} contentType="articles" profile={profile} />;
};

export default UserPage;

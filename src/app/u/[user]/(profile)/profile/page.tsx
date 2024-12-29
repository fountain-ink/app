import { UserContent } from "@/components/user/user-content";
import { getLensClientWithCookies } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClientWithCookies();
  const { profileId, handle: userHandle } = await getUserProfile(lens);
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return null;
  }

  const isUserProfile = profileId === profile.id;
  return <UserContent isUserProfile={isUserProfile} contentType="articles" profile={profile} />;
};

export default UserPage;

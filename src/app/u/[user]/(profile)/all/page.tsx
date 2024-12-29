import ErrorPage from "@/components/misc/error-page";
import { UserContent } from "@/components/user/user-content";
import { getLensClientWithCookies } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClientWithCookies();
  const { profileId } = await getUserProfile(lens);
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return <ErrorPage error="User not found" />;
  }

  const isUserProfile = profileId === profile.id;

  return (
    <div className="flex flex-col p-4">
      <UserContent contentType="all" profile={profile} isUserProfile={isUserProfile} />
    </div>
  );
};

export default UserPage;

import ErrorPage from "@/components/error-page";
import { UserContent } from "@/components/user/user-content";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const { lens, profileId } = await getAuthWithCookies();
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

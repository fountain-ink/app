import ErrorPage from "@/components/misc/error-page";
import { UserBio } from "@/components/user/user-bio";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const { lens, profileId } = await getAuthWithCookies();
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return <ErrorPage error="User not found" />;
  }

  const _isUserProfile = profileId === profile.id;

  return <div className="p-4" />;
};

export default UserPage;

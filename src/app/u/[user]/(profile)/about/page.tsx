import ErrorPage from "@/components/misc/error-page";
import { createLensClient } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await createLensClient();
  const { profileId } = await getUserProfile(lens);

  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return <ErrorPage error="User not found" />;
  }

  const _isUserProfile = profileId === profile.id;

  return <div className="p-4" />;
};

export default UserPage;

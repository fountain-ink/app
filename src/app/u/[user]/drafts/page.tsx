import { UserContent } from "@/components/user/UserContent";
import { UserDrafts } from "@/components/user/UserDrafts";
import { UserNavigation } from "@/components/user/UserNavigation";
import { getAuthorizedClients } from "@/lib/getAuthorizedClients";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const { lens, profileId: userProfileId } = await getAuthorizedClients();
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return null; // The layout will handle the notFound() case
  }

  const isUserProfile = profile.id === userProfileId;

  return (
    <>
      <UserNavigation
        username={params.user}
        isUserProfile={isUserProfile}
      />
      <UserDrafts />
    </>
  );
};

export default UserPage;

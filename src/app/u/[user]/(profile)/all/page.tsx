import ErrorPage from "@/components/misc/error-page";
import { UserContent } from "@/components/user/user-content";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { profileId } = await getUserProfile();
  const pageHandle = `lens/${params.user}`;
  
 const profile = await fetchAccount(lens, {username: {localName: params.user}}) 

  if (!profile) {
    return <ErrorPage error="User not found" />;
  }
  
  if (profile.isErr()) {
    console.error("Failed to fetch user profile");
    return <ErrorPage error="User not found" />;
  }

  const isUserProfile = profileId === profile.value?.address;

  return (
    <div className="flex flex-col p-4">
      <UserContent contentType="all" profile={profile} isUserProfile={isUserProfile} />
    </div>
  );
};

export default UserPage;

import { CloudDraftsList } from "@/components/draft/draft-list-cloud";
import ErrorPage from "@/components/misc/error-page";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";

// FIXME: Stop downloading the entirety of draft content for drafts list
export const maxDuration = 60;

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { profileId, handle: userHandle } = await getUserProfile();
  const pageHandle = `lens/${params.user}`;

  const profile = await fetchAccount(lens, { username: { localName: params.user } });

  if (!profile) {
    return notFound();
  }

  if (profile.isErr()) {
    console.error("Failed to fetch user profile");
    return notFound();
  }

  console.log(profileId, userHandle);
  if (params.user !== userHandle) {
    return <ErrorPage error="Can't access other user's drafts" />;
  }

  const _isUserProfile = userHandle === params.user;

  return (
    <div className="flex flex-col my-4 gap-4">
      <CloudDraftsList profileId={profileId} />
    </div>
  );
};

export default UserPage;

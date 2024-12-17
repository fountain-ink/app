import { CloudDraftsList } from "@/components/draft/draft-list-cloud";
import ErrorPage from "@/components/error-page";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";
import { notFound } from "next/navigation";

// FIXME: Stop downloading the entirety of draft content for drafts list
export const maxDuration = 60;

const UserPage = async ({ params }: { params: { user: string } }) => {
  const { lens, handle: userHandle, profileId } = await getAuthWithCookies();
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return notFound();
  }

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

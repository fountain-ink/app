import { DraftsList } from "@/components/draft/draft-list";
import { CloudDraftsList } from "@/components/draft/draft-list-cloud";
import ErrorPage from "@/components/error-page";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const { handle: userHandle, profileId } = await getAuthWithCookies();

  if (params.user !== userHandle) {
    return <ErrorPage error="Can't access other user's drafts" />;
  }

  return  <div className="flex flex-col items-center justify-center ">
    <div className="flex flex-col grow items-stretch justify-center w-full max-w-3xl sm:max-w-3xl">
      <h1 className="text-4xl font-bold text-center m-8">Drafts</h1>
      <CloudDraftsList profileId={profileId} />
    </div>
  </div>
;
};

export default UserPage;

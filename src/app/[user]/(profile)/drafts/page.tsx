import { DraftsList } from "@/components/draft/draft-list";
import ErrorPage from "@/components/error-page";
import { getAuthWithCookies } from "@/lib/get-auth-clients";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const { lens, handle: userHandle } = await getAuthWithCookies();
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return <ErrorPage error="User not found" />;
  }

  if (params.user !== userHandle) {
    return <ErrorPage error="Can't access other user's drafts" />;
  }

  return <DraftsList />;
};

export default UserPage;

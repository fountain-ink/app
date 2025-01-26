import { DraftList } from "@/components/draft/draft-list";
import ErrorPage from "@/components/misc/error-page";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";

// FIXME: Stop downloading the entirety of draft content for drafts list
export const maxDuration = 60;

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { address, username } = await getUserProfile();

  const profile = await fetchAccount(lens, { username: { localName: params.user } });

  if (!profile) {
    return notFound();
  }

  if (profile.isErr()) {
    console.error("Failed to fetch user profile");
    return notFound();
  }

  if (params.user !== username) {
    return <ErrorPage error="Can't access other user's drafts" />;
  }

  const _isUserProfile = username === params.user;

  return (
    <div className="flex flex-col my-4 gap-4">
      <DraftList address={address} />
    </div>
  );
};

export default UserPage;

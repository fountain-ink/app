import { fetchAccount } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";
import { DraftCreateButton } from "@/components/draft/draft-create-button";
import { ImportDialog } from "@/components/draft/draft-import-dialog";
import { DraftList } from "@/components/draft/draft-list";
import ErrorPage from "@/components/misc/error-page";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";

export const maxDuration = 60;

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { address, username } = await getUserAccount();

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
      <div className="flex justify-end items-center gap-2">
        <ImportDialog />
        <DraftCreateButton text="New Draft" />
      </div>
      <DraftList address={address} />
    </div>
  );
};

export default UserPage;

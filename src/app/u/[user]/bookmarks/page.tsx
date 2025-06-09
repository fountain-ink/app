import { BookmarksFeed } from "@/components/feed/feed-bookmarks";
import ErrorPage from "@/components/misc/error-page";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";

export const maxDuration = 60;

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { username } = await getUserAccount();
  const profile = await fetchAccount(lens, { username: { localName: params.user } });

  if (!profile) {
    return notFound();
  }

  if (profile.isErr()) {
    console.error("Failed to fetch user profile");
    return notFound();
  }

  if (params.user !== username) {
    return <ErrorPage error="Can't access other user's bookmarks" />;
  }

  if (lens.isPublicClient()) {
    return <ErrorPage error="Can't access bookmarks" />;
  }

  return <BookmarksFeed />;
};

export default UserPage;

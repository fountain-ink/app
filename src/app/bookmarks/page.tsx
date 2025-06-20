import { BookmarksFeed } from "@/components/feed/feed-bookmarks";
import ErrorPage from "@/components/misc/error-page";
import { FeedLayout } from "@/components/navigation/feed-layout";
import { getLensClient } from "@/lib/lens/client";

export const maxDuration = 60;

const BookmarksPage = async () => {
  const lens = await getLensClient();

  if (lens.isPublicClient()) {
    return <ErrorPage error="Can't access bookmarks" />;
  }

  return (
    <FeedLayout>
      <BookmarksFeed />
    </FeedLayout>
  );
};

export default BookmarksPage;

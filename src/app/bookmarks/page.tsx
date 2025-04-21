import { BookmarkList } from "@/components/bookmark/bookmark-list";
import ErrorPage from "@/components/misc/error-page";
import { getLensClient } from "@/lib/lens/client";
import { FeedNavigation } from "@/components/navigation/feed-navigation";

export const maxDuration = 60;

const BookmarksPage = async () => {
  const lens = await getLensClient();

  if (lens.isPublicClient()) {
    return <ErrorPage error="Can't access bookmarks" />;
  }

  return (
    <div className="flex flex-col mt-5 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
      <FeedNavigation />

      <div className="flex flex-col my-4 items-center w-full">
        <BookmarkList />
      </div>
    </div>
  );
};

export default BookmarksPage; 
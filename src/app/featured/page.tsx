import { getUserAccount } from "@/lib/auth/get-user-profile";
import { FeedNavigation } from "@/components/navigation/feed-navigation";
import { PostFeedWithToggle } from "@/components/post/post-feed-with-toggle";
import { getBaseUrl } from "@/lib/get-base-url";

export async function generateMetadata() {
  return {
    title: "Curated | Fountain",
    description: "Discover curated articles on Fountain",
    openGraph: {
      title: "Curated | Fountain",
      description: "Discover curated articles on Fountain",
    },
    twitter: {
      card: "summary",
      title: "Curated | Fountain",
      description: "Discover curated articles on Fountain",
    },
  };
}

const CuratedPage = async () => {
  const response = await fetch(`${getBaseUrl()}/api/curate?page=1&limit=10`, {
    cache: "no-store",
  });
  const data = await response.json();

  const initialPostIds = (data?.data?.map((item: any) => item.slug).filter(Boolean) as string[]) || [];
  const hasMore = data?.hasMore || false;

  return (
    <div className="flex flex-col mt-5 items-center justify-center w-full">
      <div className="w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
        <FeedNavigation />
      </div>

      <div className="flex flex-col my-4 items-center w-full">
        <PostFeedWithToggle 
          feedType="curated"
          initialPostIds={initialPostIds} 
          hasMore={hasMore} 
          page={1} 
        />
      </div>
    </div>
  );
};

export default CuratedPage;

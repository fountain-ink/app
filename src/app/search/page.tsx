import { AnyPost, MainContentFocus } from "@lens-protocol/client";
import { fetchPosts } from "@lens-protocol/client/actions";
import { SearchFeed } from "@/components/feed/feed-search";
import { SearchLayout } from "@/components/navigation/search-layout";
import { env } from "@/env";
import { getLensClient } from "@/lib/lens/client";
import { filterBannedPosts, getBannedAddresses } from "@/lib/utils/ban-filter";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
    tag?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q, tag } = await searchParams;
  const query = q || "";
  const searchTag = tag || "";

  const title = query
    ? `Search: ${query} - Fountain`
    : searchTag
      ? `Tag: ${searchTag} - Fountain`
      : "Search - Fountain";
  const description = query
    ? `Search results for "${query}" on Fountain`
    : searchTag
      ? `Articles tagged with "${searchTag}" on Fountain`
      : "Search articles on Fountain";

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { q, tag } = await searchParams;
  const query = q || "";
  const searchTag = tag || "";

  const lens = await getLensClient();

  if (query || searchTag) {
    const [postsResult, bannedAddresses] = await Promise.all([
      fetchPosts(lens, {
        filter: {
          metadata: {
            mainContentFocus: [MainContentFocus.Article],
            tags: searchTag ? { oneOf: [searchTag] } : undefined,
          },
          searchQuery: query || undefined,
          apps: [env.NEXT_PUBLIC_APP_ADDRESS],
        },
      }).unwrapOr(null),
      getBannedAddresses(),
    ]);

    const allPosts: AnyPost[] = postsResult?.items ? [...postsResult.items] : [];
    const filteredPosts = filterBannedPosts(allPosts, bannedAddresses);
    const pageInfo = postsResult?.pageInfo || (postsResult?.items?.length ? { next: "initial" } : {});

    return (
      <SearchLayout>
        <SearchFeed
          initialPosts={filteredPosts}
          initialPaginationInfo={pageInfo}
          initialQuery={query}
          initialTag={searchTag}
          preFilteredPosts={true}
        />
      </SearchLayout>
    );
  }

  return (
    <SearchLayout>
      <SearchFeed initialPosts={[]} initialPaginationInfo={{}} initialQuery="" initialTag="" preFilteredPosts={true} />
    </SearchLayout>
  );
};

export default SearchPage;

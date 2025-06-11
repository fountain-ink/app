import { getLensClient } from "@/lib/lens/client"
import { fetchPosts } from "@lens-protocol/client/actions"
import { MainContentFocus, AnyPost } from "@lens-protocol/client"
import { env } from "@/env"
import { SearchFeed } from "@/components/feed/feed-search"
import { FeedLayout } from "@/components/navigation/feed-layout"
import { getBannedAddresses, filterBannedPosts } from "@/lib/utils/ban-filter"

interface SearchPageProps {
  searchParams: Promise<{
    q?: string
  }>
}

export async function generateMetadata({ searchParams }: SearchPageProps) {
  const { q } = await searchParams
  const query = q || ""
  
  return {
    title: query ? `Search: ${query} - Fountain` : "Search - Fountain",
    description: query ? `Search results for "${query}" on Fountain` : "Search articles on Fountain",
    openGraph: {
      title: query ? `Search: ${query} - Fountain` : "Search - Fountain",
      description: query ? `Search results for "${query}" on Fountain` : "Search articles on Fountain",
    },
    twitter: {
      card: "summary",
      title: query ? `Search: ${query} - Fountain` : "Search - Fountain",
      description: query ? `Search results for "${query}" on Fountain` : "Search articles on Fountain",
    },
  }
}

const SearchPage = async ({ searchParams }: SearchPageProps) => {
  const { q } = await searchParams
  const query = q || ""
  
  const lens = await getLensClient()

  if (query) {
    const [postsResult, bannedAddresses] = await Promise.all([
      fetchPosts(lens, {
        filter: {
          metadata: { mainContentFocus: [MainContentFocus.Article] },
          searchQuery: query,
          apps: [env.NEXT_PUBLIC_APP_ADDRESS],
        },
      }).unwrapOr(null),
      getBannedAddresses()
    ])

    const allPosts: AnyPost[] = postsResult?.items ? [...postsResult.items] : []
    const filteredPosts = filterBannedPosts(allPosts, bannedAddresses)
    const pageInfo = postsResult?.pageInfo || (postsResult?.items?.length ? { next: "initial" } : {})

    return (
      <FeedLayout>
        <SearchFeed
          initialPosts={filteredPosts}
          initialPaginationInfo={pageInfo}
          initialQuery={query}
          preFilteredPosts={true}
        />
      </FeedLayout>
    )
  }

  return (
    <FeedLayout>
      <SearchFeed
        initialPosts={[]}
        initialPaginationInfo={{}}
        initialQuery=""
        preFilteredPosts={true}
      />
    </FeedLayout>
  )
}

export default SearchPage
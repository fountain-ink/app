"use client"

import Link from "next/link"
import { useMemo } from "react"
import { ArrowRight } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import { Account, MainContentFocus, PageSize, Post } from "@lens-protocol/client"
import { evmAddress } from "@lens-protocol/client"
import { fetchPosts } from "@lens-protocol/client/actions"
import { EvmAddress } from "@lens-protocol/metadata"
import { getLensClient } from "@/lib/lens/client"
import { PostView } from "../post/post-view"
import { Button } from "@/components/ui/button"
import { env } from "@/env"

interface ReadMoreProps {
  author: Account
  currentPostId: string
}

export function ReadMore({ author, currentPostId }: ReadMoreProps) {
  const { data: posts, isLoading } = useQuery({
    queryKey: ["posts", "author", author.address],
    queryFn: async () => {
      const lens = await getLensClient()
      const response = await fetchPosts(lens, {
        filter: {
          authors: [evmAddress(author.address)],
          apps: [env.NEXT_PUBLIC_APP_ADDRESS],
          metadata: {
            mainContentFocus: [MainContentFocus.Article],
          },
        },
        pageSize: PageSize.Ten,
      })
      return response.isOk() ? response.value.items : []
    },
    staleTime: 1000 * 60 * 60 * 24, // 1 day
  })

  const filteredPosts = useMemo(() => {
    if (!posts) return []

    return posts
      .filter((post) => post.__typename === "Post" && post.id !== currentPostId)
      .slice(0, 6) as Post[]
  }, [posts, currentPostId])

  if (isLoading) {
    return null
  }

  if (!filteredPosts.length) {
    return null
  }

  return (
    <div className="max-w-[60ch] mx-auto p-4 sm:p-8 md:px-16 py-12">
      <div className="not-article">
        <h2 className="!font-[family-name:var(--title-font)] !font-semibold !text-xl !mb-4">More from {author.username?.localName}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {filteredPosts.map((post) => (
          <PostView
            key={post.id}
            post={post}
            authors={[post.author.address as EvmAddress]}
            isVertical={true}
            options={{
              showAuthor: false,
              showDate: true,
              showTitle: true,
              showSubtitle: true,
              showContent: false,
              showPreview: true,
              showBlog: false,
              isCompact: true,
            }}
          />
        ))}
      </div>

      <div className="flex">
        <Link href={`/u/${author.username?.localName}`}>
          <Button variant="default" className="group">
            Read more
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </Link>
      </div>
    </div>
  )
}
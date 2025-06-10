"use client"

import { useState, useEffect } from "react"
import { FeedLayout } from "@/components/navigation/feed-layout"
import { TabNavigation } from "@/components/settings/tab-navigation"
import { ContestPostWrapper } from "@/components/post/post-contest-wrapper"
import { PostView } from "@/components/post/post-view"
import { PostSkeleton } from "@/components/post/post-skeleton"
import { Calendar, Trophy } from "lucide-react"
import { getLensClient } from "@/lib/lens/client"
import { fetchPosts } from "@lens-protocol/client/actions"
import type { Post, PostId } from "@lens-protocol/client"

interface Contest {
  id: string
  slug: string
  name: string
  theme?: string
  status: "upcoming" | "active" | "ended"
  prize_pool: { total: string }
}

interface ContestWinner {
  post_slug: string
  place: number
  prize_amount: string
  transaction_hash?: string
  added_at?: string
}

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>([])
  const [winners, setWinners] = useState<ContestWinner[]>([])
  const [posts, setPosts] = useState<Map<string, Post>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch all contests including ended ones
        const contestsRes = await fetch("/api/contests?includeEnded=true")
        const contestsData = await contestsRes.json()
        setContests(contestsData)

        // Fetch winners for all contests
        const winnersPromises = contestsData.map((contest: Contest) =>
          fetch(`/api/contests/${contest.slug}/winners`).then(res => res.json())
        )
        const winnersData = await Promise.all(winnersPromises)

        // Flatten all winners and sort by date (most recent first)
        const allWinners = winnersData.flatMap(data => data.winners || [])
        const sortedWinners = allWinners.sort((a, b) => {
          const dateA = a.added_at ? new Date(a.added_at).getTime() : 0
          const dateB = b.added_at ? new Date(b.added_at).getTime() : 0
          return dateB - dateA // Most recent first
        })
        setWinners(sortedWinners)

        // Fetch posts for winners
        if (allWinners.length > 0) {
          const lens = await getLensClient()
          const postSlugs = allWinners.map((w: ContestWinner) => w.post_slug as PostId)
          const postsResult = await fetchPosts(lens, { filter: { posts: postSlugs } })

          if (postsResult.isOk()) {
            const postMap = new Map()
            // Create a slug to post mapping
            const slugToPost = new Map<string, Post>()

            postsResult.value.items.forEach(post => {
              if (post.__typename === "Post") {
                // Map both by ID and by slug
                postMap.set(post.id, post)
                slugToPost.set(post.slug, post)
              }
            })

            // Now map winner slugs to posts
            const finalPostMap = new Map()
            allWinners.forEach(winner => {
              const postBySlug = slugToPost.get(winner.post_slug)
              const postById = postMap.get(winner.post_slug)
              const post = postBySlug || postById
              if (post) {
                finalPostMap.set(winner.post_slug, post)
              }
            })

            setPosts(finalPostMap)
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const weekItems = contests
    .map(contest => ({
      id: contest.slug,
      label: contest.name,
      icon: contest.status === "ended" ? Trophy : Calendar,
      enabled: true,
    }))
    .sort((a, b) => {
      const aNum = parseInt(a.id.replace("week-", ""))
      const bNum = parseInt(b.id.replace("week-", ""))
      return aNum - bNum
    })

  if (loading) {
    return (
      <FeedLayout hideViewToggle wide>
        <div className="flex flex-row gap-4">
          <TabNavigation navItems={[]} basePath="/contests" />
          <div className="flex-1">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-6">
                  {[...Array(3)].map((_, i) => (
                    <PostSkeleton key={i} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </FeedLayout>
    )
  }

  return (
    <FeedLayout hideViewToggle wide>
      <div className="flex flex-row gap-4">
        <TabNavigation navItems={weekItems} basePath="/contests" />
        <div className="flex-1">
          <div className="space-y-6">
            {winners.length > 0 ? (
              <div className="space-y-4">
                <div className="space-y-6">
                  {winners.map((winner) => {
                    const post = posts.get(winner.post_slug)
                    return post ? (
                      <PostView
                        key={`${winner.post_slug}-${winner.place}`}
        options={{
          showContent: false,
          showPreview: true,
          showAuthor: true,
          showDate: true,
          showTitle: true,
          showSubtitle: true,
        }} 
                        post={post}
                        authors={[]}
                      />
                    ) : null
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-lg border p-8 text-center">
                <p className="text-muted-foreground">No contest winners yet. Select a contest from the left to view entries.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </FeedLayout>
  )
}
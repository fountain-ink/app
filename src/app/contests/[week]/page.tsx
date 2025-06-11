"use client"

import { useState, useEffect } from "react"
import { FeedLayout } from "@/components/navigation/feed-layout"
import { TabNavigation } from "@/components/settings/tab-navigation"
import { ContestPostWrapper } from "@/components/post/post-contest-wrapper"
import { PostSkeleton } from "@/components/post/post-skeleton"
import { Calendar, Trophy } from "lucide-react"
import { useParams, useRouter } from "next/navigation"
import type { Post, PostId } from "@lens-protocol/client"
import { getLensClient } from "@/lib/lens/client"
import { fetchPosts } from "@lens-protocol/client/actions"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Contest {
  id: string
  slug: string
  name: string
  theme?: string
  status: "upcoming" | "active" | "ended"
}

interface ContestData {
  contest: {
    id: string
    name: string
    theme: string
    prize_pool: { total: string }
  }
  winners: Array<{
    post_slug: string
    place: number
    prize_amount: string
    transaction_hash?: string
  }>
  winnerMap: Record<string, {
    place: number
    prize_amount: string
    transaction_hash?: string
  }>
}

export default function ContestWeekPage() {
  const params = useParams()
  const router = useRouter()
  const weekSlug = params.week as string
  const [contestData, setContestData] = useState<ContestData | null>(null)
  const [posts, setPosts] = useState<Map<string, Post>>(new Map())
  const [loading, setLoading] = useState(true)
  const [contests, setContests] = useState<Contest[]>([])

  // Fetch all contests to show in navigation
  useEffect(() => {
    fetch("/api/contests?includeEnded=true")
      .then(res => res.json())
      .then(data => {
        setContests(data)
      })
      .catch(console.error)
  }, [])

  // Fetch contest data and winners
  useEffect(() => {
    const fetchContestData = async () => {
      setLoading(true)
      try {
        const res = await fetch(`/api/contests/${weekSlug}/winners`)
        if (res.ok) {
          const data = await res.json()
          setContestData(data)

          // Fetch ALL posts that are part of the contest
          if (data.winners.length > 0) {
            const lens = await getLensClient()
            const postSlugs = data.winners.map((w: any) => w.post_slug as PostId)
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
              data.winners.forEach((winner: any) => {
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
        }
      } catch (error) {
        console.error("Error fetching contest data:", error)
      } finally {
        setLoading(false)
      }
    }

    if (weekSlug) {
      fetchContestData()
    }
  }, [weekSlug])

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
      <FeedLayout hideViewToggle>
        <div className="relative">
          <div className="absolute -left-[200px] top-0 hidden xl:block">
            <TabNavigation navItems={weekItems} basePath="/contests" />
          </div>
          <div className="max-w-3xl mx-auto">
            <div className="">
              <div className="xl:hidden mb-4 max-w-md">
                <p className="text-sm text-muted-foreground mb-2">Pick a contest:</p>
                <Select disabled value="loading">
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Loading..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="loading">Loading contests...</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="pb-6 border-b">
                <div className="h-8 bg-muted rounded-md w-1/3 animate-pulse mb-2" />
                <div className="h-5 bg-muted rounded-md w-1/2 animate-pulse" />
              </div>
              <div className="space-y-8">
                {[...Array(3)].map((_, i) => (
                  <PostSkeleton key={i} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </FeedLayout>
    )
  }

  return (
    <FeedLayout hideViewToggle>
      <div className="relative">
        <div className="absolute -left-[200px] top-0 hidden xl:block">
          <TabNavigation navItems={weekItems} basePath="/contests" />
        </div>
        <div className="max-w-3xl mx-auto">
          <div className="">
            <div className="xl:hidden mb-4 max-w-md">
              <p className="text-sm text-muted-foreground mb-2">Pick a contest:</p>
              <Select 
                value={weekSlug} 
                onValueChange={(value) => {
                  if (value === "all-contests") {
                    router.push("/contests")
                  } else {
                    router.push(`/contests/${value}`)
                  }
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-contests">
                    All Contests
                  </SelectItem>
                  {weekItems.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="pb-6 border-b">
              <h2 className="text-2xl font-semibold mb-2">
                {contestData?.contest.name || `Week ${weekSlug.replace("week-", "")} Contest`}
              </h2>
              {contestData?.contest.theme && (
                <p className="text-muted-foreground pl-4">{contestData.contest.theme}</p>
              )}
            </div>

            {contestData && contestData.winners.length > 0 ? (
              <div className="space-y-8">
                {contestData.winners
                  .map((winner) => {
                    const post = posts.get(winner.post_slug)
                    if (!post) return null

                    const winnerInfo = contestData.winnerMap[winner.post_slug]
                    if (!winnerInfo) return null

                    return (
                      <ContestPostWrapper
                        key={winner.post_slug}
                        post={post}
                        place={winnerInfo.place}
                        prizeAmount={winnerInfo.prize_amount}
                        prizeTransactionHash={winnerInfo.transaction_hash}
                      />
                    )
                  })
                  .filter(Boolean)}
              </div>
            ) : (
              <div className="rounded-lg border p-8">
                <p className="text-muted-foreground">
                  {contestData ? "No posts added to this contest yet" : "Contest not found"}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </FeedLayout>
  )
}
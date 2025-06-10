"use client"

import { FeedLayout } from "@/components/navigation/feed-layout"
import { TabNavigation } from "@/components/settings/tab-navigation"
import { ContestPostWrapper } from "@/components/post/contest-post-wrapper"
import { Calendar } from "lucide-react"
import { useParams } from "next/navigation"
import type { Post } from "@lens-protocol/client"
import type { EvmAddress } from "@lens-protocol/metadata"

const weekItems = Array.from({ length: 12 }, (_, i) => ({
  id: `week-${i + 1}`,
  label: `Week ${i + 1}`,
  icon: Calendar,
  enabled: i < 3, // Enable first 3 weeks for now
}))

export default function ContestWeekPage() {
  const params = useParams()
  const weekNumber = params.week?.toString().replace("week-", "")

  // Mock contest data - will be replaced with actual data later
  const mockContestPosts: Array<{
    post: Post | null
    place: number
    prizeAmount?: string
    prizeTransactionHash?: string
    authors?: EvmAddress[]
  }> = []

  // Example of how it would look with data:
  // mockContestPosts = [
  //   { post: somePost, place: 1, prizeAmount: "500", prizeTransactionHash: "0x123..." },
  //   { post: somePost, place: 2, prizeAmount: "300", prizeTransactionHash: "0x456..." },
  //   { post: somePost, place: 3, prizeAmount: "200", prizeTransactionHash: "0x789..." },
  //   { post: somePost, place: 4 },
  // ]

  return (
    <FeedLayout hideViewToggle wide>
      <div className="flex flex-row gap-4">
        <TabNavigation navItems={weekItems} basePath="/contests" />
        <div className="flex-1">
          <div className="space-y-6">
            <div className="pb-6 border-b">
              <h2 className="text-2xl font-semibold mb-2">Week {weekNumber} Contest</h2>
              <p className="text-muted-foreground">Theme: Creative Writing Challenge</p>
            </div>
            
            {mockContestPosts.length > 0 ? (
              <div className="space-y-8">
                {mockContestPosts.map((contestEntry, index) => (
                  contestEntry.post && (
                    <ContestPostWrapper
                      key={index}
                      post={contestEntry.post}
                      place={contestEntry.place}
                      prizeAmount={contestEntry.prizeAmount}
                      prizeTransactionHash={contestEntry.prizeTransactionHash}
                      authors={contestEntry.authors}
                    />
                  )
                ))}
              </div>
            ) : (
              <div className="rounded-lg border p-8">
                <p className="text-muted-foreground">No contest entries yet for Week {weekNumber}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </FeedLayout>
  )
}
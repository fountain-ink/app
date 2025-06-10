"use client"

import { FeedLayout } from "@/components/navigation/feed-layout"
import { TabNavigation } from "@/components/settings/tab-navigation"
import { Calendar } from "lucide-react"

const weekItems = Array.from({ length: 12 }, (_, i) => ({
  id: `week-${i + 1}`,
  label: `Week ${i + 1}`,
  icon: Calendar,
  enabled: i < 3, // Enable first 3 weeks for now
}))

export default function ContestsPage() {
  return (
    <FeedLayout hideViewToggle wide>
      <div className="flex flex-row gap-4">
        <TabNavigation navItems={weekItems} basePath="/contests" />
        <div className="flex-1">
          <div className="rounded-lg border p-8">
            <h2 className="text-2xl font-semibold mb-4">Weekly Writing Contests</h2>
            <p className="text-muted-foreground">Select a week to view contest entries</p>
          </div>
        </div>
      </div>
    </FeedLayout>
  )
}
"use client"

import { cn } from "@/lib/utils"
import { Crown, ExternalLink } from "lucide-react"
import Link from "next/link"
import { PostView } from "./post-view"
import type { Post } from "@lens-protocol/client"
import type { EvmAddress } from "@lens-protocol/metadata"

interface ContestPostWrapperProps {
  post: Post
  place: number
  prizeAmount?: string
  prizeTransactionHash?: string
  blockExplorerUrl?: string
  authors?: EvmAddress[]
}

const placeStyles = {
  1: {
    borderColor: "border-yellow-400/80 dark:border-yellow-500/60",
    bgGradient: "from-yellow-50/50 to-yellow-100/30 dark:from-yellow-950/20 dark:to-yellow-900/10",
    crownColor: "text-yellow-600 dark:text-yellow-400",
    prizeColor: "text-yellow-700 dark:text-yellow-300"
  },
  default: {
    borderColor: "border-gray-300/60 dark:border-gray-600/40",
    bgGradient: "from-gray-50/30 to-gray-100/20 dark:from-gray-950/10 dark:to-gray-900/5",
    crownColor: "text-gray-600 dark:text-gray-400",
    prizeColor: "text-gray-700 dark:text-gray-300"
  }
}

function getOrdinalSuffix(num: number): string {
  const j = num % 10
  const k = num % 100
  if (j === 1 && k !== 11) return "st"
  if (j === 2 && k !== 12) return "nd"
  if (j === 3 && k !== 13) return "rd"
  return "th"
}

export function ContestPostWrapper({
  post,
  place,
  prizeAmount,
  prizeTransactionHash,
  blockExplorerUrl = "https://lenscan.io/tx/",
  authors = []
}: ContestPostWrapperProps) {
  const style = place === 1 ? placeStyles[1] : placeStyles.default
  const showCrown = place <= 3

  return (
    <div className={cn(
      "relative rounded-lg border p-1 pt-3 mt-2 -ml-1 -mr-4",
      style.borderColor
    )}>
      <div className={cn(
        "absolute -top-3 left-4 z-10 flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold",
        "bg-background border",
        style.borderColor
      )}>
        {showCrown && <Crown className={cn("w-4 h-4", style.crownColor)} />}
        <span className={style.prizeColor}>
          {place}{getOrdinalSuffix(place)} Place
        </span>
      </div>

      {prizeAmount && prizeTransactionHash && (
        <div className={cn(
          "absolute -top-3 right-4 z-10",
          "bg-background border rounded-full",
          style.borderColor
        )}>
          <Link
            href={`${blockExplorerUrl}${prizeTransactionHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "flex items-center gap-1 px-3 py-1 text-sm font-semibold transition-opacity hover:opacity-80",
              style.prizeColor
            )}
          >
            <span>${prizeAmount}</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      )}

      <div className={cn(
        "absolute inset-0 rounded-lg bg-gradient-to-br opacity-30",
        style.bgGradient
      )} />

      <div className="relative">
        <PostView
          options={{
            showContent: false,
            showPreview: true,
            showAuthor: true,
            showDate: true,
            showTitle: true,
            showSubtitle: true,
          }}
          isVertical={false}
          post={post} authors={authors} />
      </div>
    </div>
  )
}
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
    borderColor: "border-yellow-500",
    bgGradient: "from-yellow-50 to-yellow-100/50 dark:from-yellow-950/20 dark:to-yellow-900/10",
    crownColor: "text-yellow-600 dark:text-yellow-400",
    prizeColor: "text-yellow-700 dark:text-yellow-300"
  },
  2: {
    borderColor: "border-gray-400",
    bgGradient: "from-gray-50 to-gray-100/50 dark:from-gray-950/20 dark:to-gray-900/10",
    crownColor: "text-gray-600 dark:text-gray-400",
    prizeColor: "text-gray-700 dark:text-gray-300"
  },
  3: {
    borderColor: "border-orange-600",
    bgGradient: "from-orange-50 to-orange-100/50 dark:from-orange-950/20 dark:to-orange-900/10",
    crownColor: "text-orange-700 dark:text-orange-400",
    prizeColor: "text-orange-800 dark:text-orange-300"
  },
  default: {
    borderColor: "border-blue-500",
    bgGradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/20 dark:to-blue-900/10",
    crownColor: "text-blue-600 dark:text-blue-400",
    prizeColor: "text-blue-700 dark:text-blue-300"
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
  blockExplorerUrl = "https://etherscan.io/tx/",
  authors = []
}: ContestPostWrapperProps) {
  const style = placeStyles[place as keyof typeof placeStyles] || placeStyles.default
  const showCrown = place <= 3

  return (
    <div className={cn(
      "relative rounded-lg border-2 p-1",
      style.borderColor
    )}>
      {/* Place indicator badge */}
      <div className={cn(
        "absolute -top-3 left-4 z-10 flex items-center gap-1 px-3 py-1 rounded-full text-sm font-semibold",
        "bg-background border-2",
        style.borderColor
      )}>
        {showCrown && <Crown className={cn("w-4 h-4", style.crownColor)} />}
        <span className={style.prizeColor}>
          {place}{getOrdinalSuffix(place)} Place
        </span>
      </div>

      {/* Prize money badge (if winner) */}
      {prizeAmount && prizeTransactionHash && (
        <div className={cn(
          "absolute -top-3 right-4 z-10",
          "bg-background border-2 rounded-full",
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

      {/* Gradient background */}
      <div className={cn(
        "absolute inset-0 rounded-lg bg-gradient-to-br opacity-50",
        style.bgGradient
      )} />

      {/* Post content */}
      <div className="relative">
        <PostView post={post} authors={authors} />
      </div>
    </div>
  )
}
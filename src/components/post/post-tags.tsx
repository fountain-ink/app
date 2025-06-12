"use client"

import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { useRef, useState, useEffect } from "react"
import { cn } from "@/lib/utils"

interface PostTagsProps {
  tags: string[]
}

export function PostTags({ tags }: PostTagsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [showLeftArrow, setShowLeftArrow] = useState(false)
  const [showRightArrow, setShowRightArrow] = useState(false)

  const checkScroll = () => {
    const container = scrollContainerRef.current
    if (!container) return

    const { scrollLeft, scrollWidth, clientWidth } = container
    setShowLeftArrow(scrollLeft > 0)
    setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1)
  }

  useEffect(() => {
    checkScroll()
    const container = scrollContainerRef.current
    if (!container) return

    const handleScroll = () => checkScroll()
    container.addEventListener("scroll", handleScroll)
    window.addEventListener("resize", checkScroll)

    return () => {
      container.removeEventListener("scroll", handleScroll)
      window.removeEventListener("resize", checkScroll)
    }
  }, [tags])

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (!container) return

    const scrollAmount = container.clientWidth * 0.8
    container.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    })
  }

  if (!tags || tags.length === 0) return null

  return (
    <div className="relative flex items-center gap-2 max-w-full">
      {showLeftArrow && (
        <button
          onClick={() => scroll("left")}
          className="absolute left-0 z-10 flex items-center justify-center w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-shadow"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      )}
      
      <div
        ref={scrollContainerRef}
        className="flex items-center gap-3 overflow-x-auto scrollbar-hide scroll-smooth"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {tags.map((tag) => (
          <Link
            key={tag}
            href={`/search?tag=${encodeURIComponent(tag)}`}
            className={cn(
              "inline-flex items-center px-4 py-1.5 rounded-md text-sm",
              "border border-border hover:bg-secondary/50 transition-colors",
              "whitespace-nowrap flex-shrink-0",
              "font-[family-name:var(--title-font)]",
              "text-primary/60"
            )}
          >
            {tag}
          </Link>
        ))}
      </div>

      {showRightArrow && (
        <button
          onClick={() => scroll("right")}
          className="absolute right-0 z-10 flex items-center justify-center w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full shadow-sm hover:shadow-md transition-shadow"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      )}
    </div>
  )
}
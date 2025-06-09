"use client"

import { PostViewOptions } from "@/components/post/post-view"
import { AuthorView, LazyAuthorView } from "@/components/user/user-author-view"
import { cn, formatDate } from "@/lib/utils"
import { resolveUrl } from "@/lib/utils/resolve-url"
import { extractSubtitle } from "@/lib/extract-subtitle"
import { Post } from "@lens-protocol/client"
import { ArticleMetadata, EvmAddress } from "@lens-protocol/metadata"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useCallback, useState, MouseEvent } from "react"
import { PostMenu } from "./post-menu"
import { PostReactions } from "./post-reactions"

interface PostVerticalViewProps {
  post: Post
  authors: EvmAddress[]
  options?: PostViewOptions
  isSelected?: boolean
  onSelect?: () => void
  onEnterSelectionMode?: () => void
  isSelectionMode?: boolean
  className?: string
  priority?: boolean
}

export const PostVerticalView = ({
  post,
  authors,
  options = {
    showAuthor: true,
    showTitle: true,
    showSubtitle: true,
    showDate: true,
    showPreview: true,
    showContent: true,
    showBlog: true,
  },
  isSelected = false,
  onSelect,
  onEnterSelectionMode,
  isSelectionMode = false,
  className,
  priority = false,
}: PostVerticalViewProps) => {
  const router = useRouter()
  const [isHovered, setIsHovered] = useState(false)

  const metadata = post.metadata
  const isArticle = metadata.__typename === "ArticleMetadata"
  const articleMetadata = isArticle ? metadata as any : null

  // Get cover URL from attributes, same as regular post view
  const coverUrlFromAttributes = articleMetadata?.attributes?.find((attr: any) => attr.key === "coverUrl")?.value
  const coverUrl = coverUrlFromAttributes || articleMetadata?.attachments?.[0]?.optimistic?.uri || articleMetadata?.attachments?.[0]?.uri
  const resolvedCoverUrl = coverUrl ? resolveUrl(coverUrl) : null

  // Get subtitle
  const subtitleFromAttributes = articleMetadata?.attributes?.find((attr: any) => attr.key === "subtitle")?.value
  const contentJson = articleMetadata?.attributes?.find((attr: any) => attr.key === "contentJson")?.value
  const subtitle = subtitleFromAttributes || extractSubtitle(contentJson) || ""

  const contentText = articleMetadata?.content?.replace(/\n+/g, " ").trim() || ""

  const handleCardClick = useCallback((e: MouseEvent) => {
    if (e.shiftKey || isSelectionMode) {
      e.preventDefault()
      if (!isSelectionMode && onEnterSelectionMode) {
        onEnterSelectionMode()
      }
      if (onSelect) {
        onSelect()
      }
    } else {
      const username = post.author.username?.localName || ""
      const slug = post.slug
      router.push(`/p/${username}/${slug}`)
    }
  }, [isSelectionMode, onEnterSelectionMode, onSelect, router, post.author.username?.localName, post.slug])

  const handleInteractiveElementClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
  }, [])

  return (
    <div
      className={cn(
        "group relative flex flex-col",
        isSelectionMode && "cursor-pointer",
        isSelected && "ring-2 ring-primary rounded-xl",
        className
      )}
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image with rounded corners */}
      {options.showPreview && (
        <div className="relative w-full mb-3">
          <div className="relative w-full aspect-[4/3] overflow-hidden rounded-xl">
            {resolvedCoverUrl ? (
              <>
                <Image
                  src={resolvedCoverUrl}
                  alt={articleMetadata?.title || "Post preview"}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover transition-all duration-300 ease-in-out group-hover:scale-110"
                  priority={priority}
                  suppressHydrationWarning
                />
                <div className="absolute inset-0 pointer-events-none transition-all duration-300 ease-in-out bg-white opacity-0 group-hover:opacity-10" />
              </>
            ) : (
              <div className="absolute inset-0 bg-muted">
                <div className="placeholder-background h-full w-full">&nbsp;</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex flex-col">
        {/* Author Info */}
        <div className="flex flex-row items-center w-full gap-1 mb-2 font-[family-name:var(--paragraph-font)] text-[13px]">
          {options.showAuthor && (
            <div onClick={handleInteractiveElementClick}>
              <AuthorView showUsername={false} accounts={[post.author]} />
            </div>
          )}
          {options.showBlog && post.feed.group?.metadata && (
            <div className="">
              {options.showAuthor ? (
                <div className="flex flex-row items-center gap-1">
                  <span className="text-muted-foreground">in</span>
                  <div onClick={handleInteractiveElementClick}>
                    <Link
                      prefetch
                      href={`/b/${post.feed.group?.address}`}
                      className="text-foreground hover:underline"
                    >
                      {post.feed.group.metadata.name}
                    </Link>
                  </div>
                </div>
              ) : (
                <span className="text-foreground">{post.feed.group.metadata.name}</span>
              )}
            </div>
          )}
        </div>

        {/* Title - no line clamp */}
        {options.showTitle && articleMetadata?.title && (
          <h2
            className="text-[1.25rem] font-[family-name:var(--title-font)] tracking-[-0.6px] font-medium leading-[1.35] mb-1"
            suppressHydrationWarning
          >
            {articleMetadata.title}
          </h2>
        )}

        {/* Subtitle with line clamp */}
        {options.showSubtitle && subtitle && (
          <p
            className="text-base font-[family-name:var(--paragraph-font)] text-muted-foreground leading-[1.35] line-clamp-3"
            suppressHydrationWarning
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom row - always visible like in normal post view */}
      <div className="flex flex-row justify-between items-center mt-3 h-8 text-sm">
        <div className="flex flex-row items-center gap-3">
          {options.showDate && (
            <time className="text-xs text-muted-foreground" suppressHydrationWarning>
              {formatDate(post.timestamp)}
            </time>
          )}
          <div onClick={handleInteractiveElementClick}>
            <PostReactions post={post} />
          </div>
        </div>
        
        <div className="flex justify-end">
          <div onClick={handleInteractiveElementClick}>
            <PostMenu post={post} />
          </div>
        </div>
      </div>
    </div>
  )
}
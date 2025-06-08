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
import { motion, AnimatePresence } from "motion/react"

interface PostVerticalViewProps {
  post: Post
  authors: EvmAddress[]
  options?: PostViewOptions
  isSelected?: boolean
  onSelect?: () => void
  onEnterSelectionMode?: () => void
  isSelectionMode?: boolean
  className?: string
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
        <div className="relative w-full overflow-hidden rounded-xl mb-3">
          {resolvedCoverUrl ? (
            <div className="relative w-full">
              <Image
                src={resolvedCoverUrl}
                alt={articleMetadata?.title || "Post preview"}
                width={400}
                height={300}
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="w-full h-auto object-cover transition-all duration-300 ease-in-out group-hover:scale-110"
                suppressHydrationWarning
              />
              <div className="absolute inset-0 pointer-events-none transition-all duration-300 ease-in-out bg-white opacity-0 group-hover:opacity-10" />
            </div>
          ) : (
            <div className="relative w-full aspect-[4/3] bg-muted rounded-xl">
              <div className="placeholder-background h-full w-full rounded-xl">&nbsp;</div>
            </div>
          )}
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
            className="text-[1.375rem] font-[family-name:var(--title-font)] tracking-[-0.8px] font-medium leading-[1.375] mb-1"
            suppressHydrationWarning
          >
            {articleMetadata.title}
          </h2>
        )}

        {/* Subtitle with line clamp */}
        {options.showSubtitle && subtitle && (
          <p
            className="text-[1.0625rem] font-[family-name:var(--paragraph-font)] text-muted-foreground leading-[1.375] line-clamp-3"
            suppressHydrationWarning
          >
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom row - appears on hover, absolutely positioned below the card */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute top-full left-0 right-0 flex items-center justify-between bg-background/95 backdrop-blur-sm p-3 rounded-xl z-10"
          >
            {options.showDate && (
              <time className="text-xs text-muted-foreground" suppressHydrationWarning>
                {formatDate(post.timestamp)}
              </time>
            )}

            <div className="flex items-center gap-2">
              <div onClick={handleInteractiveElementClick}>
                <PostReactions post={post} />
              </div>
              <div onClick={handleInteractiveElementClick}>
                <PostMenu post={post} />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
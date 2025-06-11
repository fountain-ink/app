import PostSkeleton from "@/components/post/post-skeleton"
import { SearchLayout } from "@/components/navigation/search-layout"
import { Skeleton } from "@/components/ui/skeleton"
import { Search } from "lucide-react"

export default function Loading() {
  return (
    <SearchLayout>
      <div className="w-full space-y-6">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
          <div className="max-w-3xl mx-auto flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <Skeleton className="h-9 w-[72px] rounded-md" />
          </div>
        </div>
        
        <div className="flex flex-col gap-4 items-center w-full">
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
          <PostSkeleton />
        </div>
      </div>
    </SearchLayout>
  )
}
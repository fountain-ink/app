'use client'

import { SessionType, useRefreshToken, useSession } from "@lens-protocol/react-web"
import { PlusIcon, FileEditIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Suspense, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Skeleton } from "@/components/ui/skeleton"
import { DraftsList } from "./DraftsList"


export const WriteMenu = () => {
  const { data: session, loading, error } = useSession()
  const [isOpen, setIsOpen] = useState(false)

  if (loading || error) {
    return null
  }

  if (session?.type !== SessionType.WithProfile) {
    return null
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button onClick={() => setIsOpen(true)}>Write</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Write an Article</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Button variant="ghost" className="w-full justify-start" asChild>
            <Link href="/write" onClick={() => setIsOpen(false)} className="flex gap-2 text-md">
              <PlusIcon className="h-5 w-5" />
              New Article
            </Link>
          </Button>
          <div className="border-t pt-4">
            <h3 className="mb-2 font-semibold">Continue writing</h3>
            <Suspense fallback={<Skeleton className="w-full h-24" />}>
              <DraftsList />
            </Suspense>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
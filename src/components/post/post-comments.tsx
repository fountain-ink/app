"use client";

import { Sheet, SheetContent } from "@/components/ui/sheet";
import { useRouter, useSearchParams } from "next/navigation";
import { Post } from "@lens-protocol/client";

export const PostComments = ({ post }: { post: Post }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.has("comments");

  const handleClose = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("comments");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <SheetContent side="right" className="w-full sm:w-[500px] p-0">
        <div className="h-full flex flex-col p-6">
          <h2 className="text-2xl font-semibold mb-4">Comments</h2>
          <div className="flex-1 overflow-auto">
            {/* TODO: Add comments list here */}
            <div className="text-muted-foreground">Comments coming soon...</div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}; 
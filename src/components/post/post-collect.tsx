"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { useRouter, useSearchParams } from "next/navigation";
import { Post } from "@lens-protocol/client";

export const PostCollect = ({ post }: { post: Post }) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isOpen = searchParams.has("collect");

  const handleClose = () => {
    const params = new URLSearchParams(searchParams);
    params.delete("collect");
    router.push(`?${params.toString()}`, { scroll: false });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">Collect Post</h2>
            <p className="text-sm text-muted-foreground">
              Support the creator by collecting this post
            </p>
          </div>
          {/* TODO: Add collect functionality */}
          <div className="text-muted-foreground">Collect functionality coming soon...</div>
        </div>
      </DialogContent>
    </Dialog>
  );
}; 
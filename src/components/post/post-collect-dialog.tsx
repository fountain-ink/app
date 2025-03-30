"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Post } from "@lens-protocol/client";

interface PostCollectProps {
  post: Post;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const PostCollect = ({ post, isOpen, onOpenChange }: PostCollectProps) => {
  return (
    <Dialog modal={true} open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-semibold">Collect Post</h2>
            <p className="text-sm text-muted-foreground">Support the creator by collecting this post</p>
          </div>
          {/* TODO: Add collect functionality */}
          <div className="text-muted-foreground">Collect functionality coming soon...</div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

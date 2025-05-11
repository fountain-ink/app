import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { getBaseUrl } from "@/lib/get-base-url";
import { Post, postId } from "@lens-protocol/client";
import { deletePost } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { getCookie } from "cookies-next";
import { Bookmark, Link, MoreHorizontal, Trash2, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useWalletClient } from "wagmi";
import { ActionButton, type DropdownItem } from "./post-action-button";
import { usePostActions } from "@/hooks/use-post-actions";
import { getLensClient } from "@/lib/lens/client";
import { useState } from "react";
import { createDraft } from "@/lib/plate/create-draft";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { getRandomUid } from "@/lib/get-random-uid";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ConfirmButton } from "@/components/ui/confirm-button";

export const PostMenu = ({ post }: { post: Post }) => {
  const { handleBookmark, stats, operations, isLoggedIn } = usePostActions(post);
  const { data: walletClient } = useWalletClient();
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isCreatingDraft, setIsCreatingDraft] = useState(false);
  const { saveDocument } = useDocumentStorage();

  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${getBaseUrl()}p/${post.author.username?.localName}/${post.slug}`);
    toast.success("Link copied to clipboard");
  };

  const appToken = getCookie("appToken");
  const claims = getTokenClaims(appToken);

  const isUserPost = post.author.address === claims?.sub;

  const handleEditPost = async () => {
    if (isCreatingDraft) return;
    setIsCreatingDraft(true);

    try {
      const attributes = post.metadata.__typename === 'ArticleMetadata'
        ? post.metadata.attributes
        : [];

      const contentJsonAttribute = attributes.find(
        (attr: { key: string; value: any }) => attr.key === "contentJson"
      );

      if (!contentJsonAttribute || !contentJsonAttribute.value) {
        toast.error("Cannot edit this post: Original content not available");
        return;
      }

      let contentJson;
      try {
        contentJson = JSON.parse(contentJsonAttribute.value as string);
      } catch (e) {
        toast.error("Cannot edit this post: Failed to parse content data");
        return;
      }

      const documentId = getRandomUid();

      await createDraft({
        initialContent: contentJson,
        publishedId: post.id,
        documentId
      });

      saveDocument(documentId, {
        documentId,
        published_id: post.id,
        contentJson,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      } as any);

      toast.success("Created editable draft from post");

      router.push(`/write/${documentId}`);
    } catch (error) {
      console.error("Failed to create editable draft:", error);
      toast.error("Failed to create editable draft");
    } finally {
      setIsCreatingDraft(false);
    }
  };

  const openDeleteDialog = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!operations?.canDelete) {
      toast.error("Unable to determine if you can delete this post");
      return;
    }

    try {
      setIsDeleting(true);
      const lens = await getLensClient();

      if (!lens.isSessionClient()) {
        toast.error("You need to be logged in to delete a post");
        return;
      }

      const result = await deletePost(lens, {
        post: postId(post.id),
      })
        .andThen(handleOperationWith(walletClient as any))
        .andThen(lens.waitForTransaction);

      if (result.isErr()) {
        console.error("Error deleting post:", result.error);
        toast.error(`Error deleting post: ${result.error.message}`);
        return;
      }

      toast.success("Post deleted successfully");
      setIsDeleteDialogOpen(false);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete post:", error);
      toast.error("Failed to delete post");
    } finally {
      setIsDeleting(false);
    }
  };

  const dropdownItems: DropdownItem[] = [
    {
      icon: Link,
      label: "Copy link",
      onClick: handleCopyLink,
    },
    ...(isUserPost
      ? [
        {
          icon: Pencil,
          label: isCreatingDraft ? "Creating draft..." : "Edit post",
          onClick: isCreatingDraft ? () => { } : handleEditPost,
        },
        {
          icon: Trash2,
          label: "Delete post",
          onClick: openDeleteDialog,
        },
      ]
      : []),
  ];

  const hasBookmarked = operations?.hasBookmarked || false;

  return (
    <>
      <div className="flex flex-row  items-center justify-center">
        <ActionButton
          icon={Bookmark}
          label="Bookmark"
          strokeColor="hsl(var(--primary))"
          fillColor="hsl(var(--primary) / 0.8)"
          onClick={handleBookmark}
          isActive={hasBookmarked}
          isUserLoggedIn={isLoggedIn}
          initialCount={stats.bookmarks}
          isDisabled={!isLoggedIn}
        />
        <ActionButton
          icon={MoreHorizontal}
          label="More"
          strokeColor="hsl(var(--muted-foreground))"
          fillColor="hsl(var(--muted-foreground))"
          dropdownItems={dropdownItems}
          showChevron={false}
          initialCount={0}
          isUserLoggedIn={true}
        />
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this post? This action <b>cannot be undone</b>.
              <br />
              <br />
              <span className="text-muted-foreground">Hold the delete button to confirm.</span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <ConfirmButton
              variant="destructive"
              onConfirm={handleDelete}
              disabled={isDeleting}
              duration={2000}
              icon={Trash2}
              className="gap-2"
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </ConfirmButton>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

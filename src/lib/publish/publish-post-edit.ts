import { getLensClient } from "@/lib/lens/client";
import { storageClient } from "@/lib/lens/storage-client";
import { TransactionIndexingError, postId, uri } from "@lens-protocol/client";
import { currentSession, editPost, fetchAccount, fetchPost } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { MetadataAttributeType, article } from "@lens-protocol/metadata";
import { toast } from "sonner";
import { type UseWalletClientReturnType } from "wagmi";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { Draft } from "@/components/draft/draft";
import { getPostContent } from "./get-post-content";

/**
 * Edits an existing post on Lens Protocol
 * @param draft The draft containing the updated content
 * @param walletClient The wallet client for signing transactions
 * @param router Next.js router for navigation
 * @param queryClient React Query client for invalidating queries
 * @returns Promise<boolean> indicating success or failure
 */
export async function publishPostEdit(
  draft: Draft,
  walletClient: UseWalletClientReturnType["data"],
  router: ReturnType<typeof useRouter>,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<boolean> {
  try {
    if (!draft.published_id) {
      toast.error("Cannot edit: Missing reference to original post");
      return false;
    }

    const documentId = draft.documentId;
    const lensDisplay = draft.distributionSettings?.lensDisplay || "title";

    const lens = await getLensClient();
    if (!lens.isSessionClient()) {
      toast.error("Please log in to edit this post");
      return false;
    }

    const authenticatedUser = await lens.getAuthenticatedUser();
    if (authenticatedUser.isErr()) {
      toast.error("Please log in to edit this post");
      return false;
    }

    const account = await fetchAccount(lens, { address: authenticatedUser.value?.address });
    if (account.isErr()) {
      toast.error("Please log in to edit this post");
      return false;
    }

    const username = account.value?.username?.localName;
    if (!username) {
      toast.error("Please log in to edit this post");
      return false;
    }

    const pendingToast = toast.loading("Updating post...");

    try {
      // Create metadata for the edited post
      const attributes: any = [
        { key: "contentJson", type: MetadataAttributeType.JSON, value: JSON.stringify(draft.contentJson) },
      ];

      if (draft.subtitle) {
        attributes.push({ key: "subtitle", type: MetadataAttributeType.STRING, value: draft.subtitle });
      }

      if (draft.coverUrl) {
        attributes.push({ key: "coverUrl", type: MetadataAttributeType.STRING, value: draft.coverUrl });
      }

      if (draft.slug) {
        attributes.push({ key: "slug", type: MetadataAttributeType.STRING, value: draft.slug });
      }

      if (draft.collectingSettings?.collectingLicense) {
        attributes.push({ key: "license", type: MetadataAttributeType.STRING, value: draft.collectingSettings.collectingLicense });
      }

      // Add lens display preference
      attributes.push({ key: "lensDisplay", type: MetadataAttributeType.STRING, value: lensDisplay });

      // Use the helper function to generate the appropriate content based on lensDisplay setting
      const postContent = getPostContent(draft, username);

      const metadata = article({
        title: draft.title || "",
        content: postContent,
        locale: "en",
        tags: draft.tags || [],
        attributes,
      });

      const { uri: contentUri } = await storageClient.uploadAsJson(metadata);
      console.log("Uploaded metadata:", metadata, contentUri);

      const result = await editPost(lens, {
        contentUri: uri(contentUri),
        post: postId(draft.published_id),
      })
        .andThen(handleOperationWith(walletClient as any))
        .andThen(lens.waitForTransaction);

      if (result.isErr()) {
        toast.dismiss(pendingToast);
        const error = result.error;
        if (error instanceof TransactionIndexingError) {
          switch (error.name) {
            case "TransactionIndexingError":
              toast.error("Transaction indexing failed");
              break;
            default:
              toast.error("Unknown error occurred while processing transaction");
          }
        } else {
          toast.error("Unexpected error occurred while processing transaction");
          console.error("Unexpected error occurred while processing transaction", error);
        }
        return false;
      }

      const postValue = await fetchPost(lens, { post: draft.published_id });

      if (postValue.isErr()) {
        toast.error(`Failed to fetch updated post: ${postValue.error.message}`);
        console.error("Failed to fetch updated post:", postValue.error);
        return false;
      }

      const postSlug = postValue.value?.__typename === "Post" ? postValue.value.slug : postValue.value?.id;

      toast.dismiss(pendingToast);
      toast.success("Post updated successfully!");

      if (postSlug && username) {
        // Update record in our database if the slug changed
        try {
          const recordResponse = await fetch('/api/posts', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              lens_slug: postSlug,
              slug: draft.slug,
              handle: username,
              post_id: draft.published_id,
            }),
          });

          if (!recordResponse.ok) {
            console.error('Failed to update post record:', await recordResponse.text());
          } else {
            console.log('Post record updated successfully');
          }
        } catch (error) {
          console.error('Error updating post record:', error);
        }

        router.push(`/p/${username}/${postSlug}?updated=true`);
        router.refresh();
      }

      try {
        const res = await fetch(`/api/drafts?id=${documentId}`, {
          method: "DELETE",
        });

        if (res.ok) {
          queryClient.invalidateQueries({
            queryKey: ["drafts"],
            refetchType: "active",
          });
        } else {
          console.error("Failed to delete draft after publication");
        }
      } catch (error) {
        console.error("Error deleting draft:", error);
      }

      return true;
    } catch (error) {
      toast.dismiss(pendingToast);
      console.error("Error updating post:", error);
      toast.error("An error occurred while updating the post. See console for details");
      return false;
    }
  } catch (error) {
    console.error("Error in publishPostEdit:", error);
    toast.error("An error occurred while updating the post. See console for details");
    return false;
  }
} 
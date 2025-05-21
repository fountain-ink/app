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
import { getPostAttributes } from "./get-post-attributes";
import { createPostRecord } from "./create-post-record";
import { getUserAccount } from "../auth/get-user-profile";
import { deleteCloudDraft } from "./delete-cloud-draft";
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
  if (!draft.published_id) {
    toast.error("Cannot edit: Missing reference to original post");
    return false;
  }

  const documentId = draft.documentId;

  const { username, account, address } = await getUserAccount();
  if (!username || !address || !account) {
    toast.error("Please log in to proceed.");
    return false;
  }
  const lens = await getLensClient();
  if (!lens.isSessionClient()) {
    toast.error("Please log in to proceed.");
    return false;
  }

  const pendingToast = toast.loading("Updating post...");

  const postContent = getPostContent(draft, username);
  const attributes = await getPostAttributes({ draft, username });

  if (!attributes) {
    toast.dismiss(pendingToast);
    toast.error("Failed to get post attributes for the update.");
    return false;
  }

  const metadata = article({
    title: draft.title || "",
    content: postContent,
    locale: "en",
    tags: draft.tags || [],
    attributes,
  });

  const { uri: updatedContentUri } = await storageClient.uploadAsJson(metadata);

  if (!updatedContentUri) {
    toast.dismiss(pendingToast);
    toast.error("Failed to upload metadata for the post update.");
    return false;
  }

  const result = await editPost(lens, {
    contentUri: uri(updatedContentUri),
    post: postId(draft.published_id),
  })
    .andThen(handleOperationWith(walletClient as any))
    .andThen(lens.waitForTransaction);

  if (result.isErr()) {
    toast.dismiss(pendingToast);
    toast.error("Failed to update post", { description: result.error.message });
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
    await createPostRecord({
      lensSlug: postSlug,
      draftSlug: draft.slug || undefined,
      username,
      postId: postId(draft.published_id),
    });

    router.push(`/p/${username}/${postSlug}?updated=true`);
    router.refresh();
  }

  await deleteCloudDraft({ documentId, queryClient });

  return true;
}

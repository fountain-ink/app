import { PostId, TransactionIndexingError } from "@lens-protocol/client";
import { fetchPost, post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { article } from "@lens-protocol/metadata";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { type UseWalletClientReturnType } from "wagmi";
import type { Draft } from "@/components/draft/draft";
import { getLensClient } from "@/lib/lens/client";
import { storageClient } from "@/lib/lens/storage-client";
import { getUserAccount } from "../auth/get-user-profile";
import { createNewsletterCampaign } from "./create-newsletter-campaign";
import { createPostRecord } from "./create-post-record";
import { deleteCloudDraft } from "./delete-cloud-draft";
import { getFeedAddress } from "./get-feed-address";
import { getPostActions } from "./get-post-actions";
import { getPostAttributes } from "./get-post-attributes";
import { getPostContent } from "./get-post-content";

export async function publishPost(
  draft: Draft,
  walletClient: UseWalletClientReturnType["data"],
  router: ReturnType<typeof useRouter>,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<boolean> {
  const documentId = draft.documentId;
  const collectingSettings = draft.collectingSettings;
  const sendNewsletter = draft.distributionSettings?.sendNewsletter;
  const selectedBlogAddress = draft.distributionSettings?.selectedBlogAddress;

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

  const pendingToast = toast.loading("Publishing post...");

  const postContent = getPostContent(draft, username);

  const attributes = await getPostAttributes({ draft, username });
  if (!attributes) {
    toast.dismiss(pendingToast);
    toast.error("Failed to get post attributes");
    return false;
  }

  const metadata = article({
    title: draft.title || "",
    content: postContent,
    locale: "en",
    tags: draft.tags || [],
    attributes,
  });

  const { uri: contentUri } = await storageClient.uploadAsJson(metadata);

  if (!contentUri) {
    toast.dismiss(pendingToast);
    toast.error("Failed to upload metadata for the post.");
    return false;
  }

  const feed = await getFeedAddress(lens, selectedBlogAddress);

  const actions = getPostActions(collectingSettings, address);

  const result = await post(lens, {
    contentUri,
    feed,
    actions,
  })
    .andThen(handleOperationWith(walletClient))
    .andTee((v) => {
      console.log(v);
    })
    .andThen(lens.waitForTransaction);

  if (result.isErr()) {
    toast.dismiss(pendingToast);
    const error = result.error as TransactionIndexingError;
    switch (error.name) {
      case "TransactionIndexingError":
        toast.error("Transaction indexing failed");
        break;
      default:
        toast.error("Unknown error occurred while processing transaction");
    }
    return false;
  }

  const hash = result.value;
  const postValue = await fetchPost(lens, { txHash: hash });

  if (postValue.isErr()) {
    toast.error(`Failed to fetch post: ${postValue.error.message}`);
    console.error("Failed to fetch post:", postValue.error);
    return false;
  }

  const postSlug = postValue.value?.__typename === "Post" ? postValue.value.slug : postValue.value?.id;
  if (!postSlug) {
    toast.dismiss(pendingToast);
    toast.error("Failed to get post slug");
    return false;
  }

  toast.dismiss(pendingToast);
  toast.success("Post published successfully!");

  await deleteCloudDraft({ documentId, queryClient });

  await createPostRecord({
    lensSlug: postSlug,
    draftSlug: draft.slug || undefined,
    username,
    postId: postValue.value?.id as PostId,
  });

  const redirectSlug = draft.slug || postSlug;
  router.push(`/p/${username}/${redirectSlug}?success=true`);
  router.refresh();

  if (sendNewsletter) {
    console.log("Creating newsletter campaign for post:", {
      blogAddress: selectedBlogAddress,
      postSlug,
      username,
      title: draft.title,
    });
    await createNewsletterCampaign({
      selectedBlogAddress,
      postSlug,
      username,
      draft,
    });
  }

  return true;
}

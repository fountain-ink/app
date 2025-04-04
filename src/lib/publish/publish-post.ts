import { getLensClient } from "@/lib/lens/client";
import { storageClient } from "@/lib/lens/storage-client";
import { TransactionIndexingError } from "@lens-protocol/client";
import { currentSession, fetchGroup, fetchPost, post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { MetadataAttributeType, article } from "@lens-protocol/metadata";
import { dateTime, evmAddress } from "@lens-protocol/client";
import { toast } from "sonner";
import { type UseWalletClientReturnType } from "wagmi";
import { createClient } from "@/lib/supabase/client";
import { createCampaignForPost } from "@/lib/listmonk/newsletter";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import type { CollectingSettings, Draft } from "@/components/draft/draft";

export async function publishPost(
  draft: Draft,
  walletClient: UseWalletClientReturnType["data"],
  router: ReturnType<typeof useRouter>,
  queryClient: ReturnType<typeof useQueryClient>,
): Promise<boolean> {
  try {
    const anyDraft = draft;
    const documentId = typeof draft.id === "string" ? draft.id : String(draft.id || "");
    const collectingSettings = draft.collectingSettings;
    const sendNewsletter = anyDraft.publishingSettings?.sendNewsletter;

    const lens = await getLensClient();
    if (!lens.isSessionClient()) {
      toast.error("Please log in to publish");
      return false;
    }

    const account = await lens.getAuthenticatedUser();
    const session = await currentSession(lens).unwrapOr(null);
    if (!session || account.isErr()) {
      toast.error("Please log in to publish");
      return false;
    }

    const pendingToast = toast.loading("Publishing post...");

    try {
      const attributes: any = [
        { key: "contentJson", type: MetadataAttributeType.JSON, value: JSON.stringify(draft.contentJson) },
      ];

      if (draft.subtitle) {
        attributes.push({ key: "subtitle", type: MetadataAttributeType.STRING, value: draft.subtitle });
      }

      if (draft.coverUrl) {
        attributes.push({ key: "coverUrl", type: MetadataAttributeType.STRING, value: draft.coverUrl });
      }

      const metadata = article({
        title: draft.title || "",
        content: draft.contentMarkdown || "",
        locale: "en",
        tags: draft.tags || [],
        attributes,
      });

      const { uri } = await storageClient.uploadAsJson(metadata);
      console.log(metadata, uri);

      let feedValue: string | undefined = undefined;
      if (draft.blogAddress) {
        const blog = await fetchGroup(lens, {
          group: draft.blogAddress,
        });

        if (blog.isErr()) {
          toast.dismiss(pendingToast);
          toast.error("Failed to fetch blog data");
          return false;
        }

        feedValue = blog.value?.feed?.address ?? undefined;
      }

      console.log("feed is", feedValue);

      const payToCollectConfig =
        collectingSettings?.isChargeEnabled && collectingSettings.price
          ? {
              amount: {
                /// WGRASS
                currency: evmAddress("0x6bDc36E20D267Ff0dd6097799f82e78907105e2F"),
                value: collectingSettings.price,
              },
              ...(collectingSettings.isReferralRewardsEnabled
                ? { referralShare: collectingSettings.referralPercent }
                : {}),
              recipients:
                collectingSettings.isRevenueSplitEnabled && collectingSettings.recipients.length > 0
                  ? collectingSettings.recipients.map((r) => ({
                      address: evmAddress(r.address),
                      percent: r.percentage,
                    }))
                  : [
                      {
                        address: evmAddress(account.value?.address),
                        percent: 100,
                      },
                    ],
            }
          : undefined;

      const actions = collectingSettings?.isCollectingEnabled
        ? [
            {
              simpleCollect: {
                ...(collectingSettings.isLimitedEdition
                  ? { collectLimit: Number(collectingSettings.collectLimit) }
                  : undefined),
                ...(collectingSettings.isCollectExpiryEnabled
                  ? {
                      endsAt: dateTime(
                        new Date(
                          new Date().getTime() + collectingSettings.collectExpiryDays * 24 * 60 * 60 * 1000,
                        ).toISOString(),
                      ),
                    }
                  : undefined),
                ...(payToCollectConfig ? { payToCollect: payToCollectConfig } : undefined),
              },
            },
          ]
        : undefined;

      console.log("actions", actions);

      const result = await post(lens, {
        contentUri: uri,
        feed: feedValue,
        actions: actions,
      })
        .andThen(handleOperationWith(walletClient as any))
        .andTee((v) => {
          console.log(v);
        })
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

      const hash = result.value;
      const postValue = await fetchPost(lens, { txHash: hash });

      if (postValue.isErr()) {
        toast.error(`Failed to fetch post: ${postValue.error.message}`);
        console.error("Failed to fetch post:", postValue.error);
        return false;
      }

      const postSlug = postValue.value?.__typename === "Post" ? postValue.value.slug : postValue.value?.id;
      const username =
        postValue.value?.__typename === "Post" ? postValue.value.author.username?.localName : postValue.value?.id;

      toast.dismiss(pendingToast);
      toast.success("Post published successfully!");

      if (postSlug && username) {
        router.push(`/p/${username}/${postSlug}?success=true`);
        router.refresh();
      }

      if (draft.blogAddress && postSlug && username && documentId && sendNewsletter) {
        try {
          const db = await createClient();
          const { data: blog } = await db.from("blogs").select("*").eq("address", draft.blogAddress).single();

          if (blog?.mail_list_id) {
            try {
              const newsletterPostData = {
                title: draft.title || "",
                subtitle: draft.subtitle || "",
                content: draft.contentMarkdown || "",
                coverUrl: draft.coverUrl || "",
                username,
              };

              try {
                const result = await createCampaignForPost(draft.blogAddress, postSlug, newsletterPostData);
                if (result?.success) {
                  console.log("Created campaign for mailing list subscribers");
                } else {
                  console.error("Failed to create campaign for mailing list");
                }
              } catch (error) {
                console.error("Error creating campaign for mailing list:", error);
              }
            } catch (error) {
              console.error("Error fetching blog data:", error);
            }
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
              console.error("Failed to delete cloud draft after publication");
            }
          } catch (error) {
            console.error("Error deleting cloud draft:", error);
          }
        } catch (error) {
          console.error("Error in post-publish operations:", error);
        }
      }

      return true;
    } catch (error) {
      toast.dismiss(pendingToast);
      console.error("Error creating post:", error);
      toast.error("An error occurred while creating the post. See console for details");
      return false;
    }
  } catch (error) {
    console.error("Error publishing post:", error);
    toast.error("An error occurred while publishing. See console for details");
    return false;
  }
}

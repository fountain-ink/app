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
  walletClient: UseWalletClientReturnType['data'],
  router: ReturnType<typeof useRouter>,
  queryClient: ReturnType<typeof useQueryClient>
): Promise<boolean> {
  console.log(draft, walletClient, router, queryClient);
  try {
    const anyDraft = draft as any;
    const documentId = typeof draft.id === 'string' ? draft.id : String(draft.id || "");
    const collectingSettings = draft.collectingSettings;
    const sendNewsletter = anyDraft.publishingSettings?.sendNewsletter;

    const lens = await getLensClient();
    if (!lens.isSessionClient()) {
      toast.error("Please log in to publish");
      return false;
    }

    const session = await currentSession(lens).unwrapOr(null);
    if (!session) {
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
      if (draft.blog && draft.blog.address !== draft.blog.owner) {
        const blog = await fetchGroup(lens, {
          group: draft.blog.address,
        });

        if (blog.isErr()) {
          toast.dismiss(pendingToast);
          toast.error("Failed to fetch blog data");
          return false;
        }

        feedValue = blog.value?.feed ?? undefined;
      }

      console.log("feed is", feedValue);


      const payToCollectConfig = collectingSettings?.isChargeEnabled && collectingSettings.price
        ? {
          amount: {
            /// WGRASS
            currency: evmAddress("0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8"),
            value: collectingSettings.price,
          },
          ...(collectingSettings.isReferralRewardsEnabled ? { referralShare: collectingSettings.referralPercent } : {}),
          recipients: collectingSettings.isRevenueSplitEnabled && collectingSettings.recipients.length > 0
            ? collectingSettings.recipients.map((r) => ({
              address: evmAddress(r.address),
              percent: r.percentage,
            }))
            : [],
        }
        : undefined;

      const result = await post(lens, {
        contentUri: uri,
        feed: feedValue,
        actions: collectingSettings?.isCollectingEnabled
          ? [
            {
              simpleCollect: {
                ...(collectingSettings.isLimitedEdition && collectingSettings.collectLimit ? { collectLimit: Number.parseInt(collectingSettings.collectLimit) } : {}),
                ...(collectingSettings.isCollectExpiryEnabled ? { endsAt: dateTime(collectingSettings.collectExpiryDate) } : {}),
                ...(payToCollectConfig ? { payToCollect: payToCollectConfig } : {}),
              },
            },
          ]
          : undefined,
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

      if (draft.blog && postSlug && username && documentId && sendNewsletter) {
        try {
          if (draft.blog.mail_list_id) {
            try {
              const db = await createClient();
              const { data: blog } = await db
                .from("blogs")
                .select("*")
                .eq("address", draft.blog.address)
                .single();

              if (blog?.mail_list_id) {
                const newsletterPostData = {
                  title: draft.title || "",
                  subtitle: draft.subtitle || "",
                  content: draft.contentMarkdown || '',
                  coverUrl: draft.coverUrl || "",
                  username
                };

                try {
                  const result = await createCampaignForPost(draft.blog.address, postSlug, newsletterPostData);
                  if (result?.success) {
                    console.log("Created campaign for mailing list subscribers");
                  } else {
                    console.error("Failed to create campaign for mailing list");
                  }
                } catch (error) {
                  console.error("Error creating campaign for mailing list:", error);
                }
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
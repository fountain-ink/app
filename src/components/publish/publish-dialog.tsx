"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { PenIcon, ShoppingBag as ShoppingBagIcon, AlertCircleIcon, CircleDollarSignIcon } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
import { ArticleDetailsTab, detailsFormSchema, DetailsFormValues } from "./publish-details-tab";
import { MonetizationTab, collectingFormSchema, CollectingFormValues } from "./publish-monetization-tab";
import { publishPost } from "../../lib/publish/publish-post";
import { usePublishDraft } from "../../hooks/use-publish-draft";
import { extractMetadata } from "@/lib/extract-metadata";
import { Draft } from "../draft/draft";
import { cn } from "@/lib/utils";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { useAuthenticatedUser } from "@lens-protocol/react";

const isUserBlog = (blogAddress: string | undefined, blogs: any[]): boolean => {
  if (!blogAddress) return false;
  const blog = blogs.find((b) => b.address === blogAddress);
  return blog ? blog.address === blog.owner : false;
};

const combinedSchema = z.object({
  details: detailsFormSchema,
  collecting: collectingFormSchema,
});

export type CombinedFormValues = z.infer<typeof combinedSchema>;

interface PublishMenuProps {
  documentId: string;
}

export const PublishMenu = ({ documentId }: PublishMenuProps) => {
  const [open, setOpen] = useState(false);
  const { getDraft, updateDraft } = usePublishDraft(documentId);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");
  const { blogState } = useBlogStorage();
  const { data: user, loading: userLoading } = useAuthenticatedUser();

  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();

  const form = useForm<CombinedFormValues>({
    resolver: zodResolver(combinedSchema),
    mode: "onChange",
    defaultValues: async () => {
      const draft = getDraft();
      // console.log("Draft for defaultValues:", draft);

      const defaultCollecting: CollectingFormValues = {
        isCollectingEnabled: false,
        collectingLicense: "CC BY-NC 4.0",
        isChargeEnabled: false,
        price: "0",
        currency: "GHO",
        isReferralRewardsEnabled: false,
        referralPercent: 25,
        isRevenueSplitEnabled: false,
        recipients: [],
        isLimitedEdition: false,
        collectLimit: undefined,
        isCollectExpiryEnabled: false,
        collectExpiryDays: undefined,
      };
      const defaultDetails: DetailsFormValues = {
        title: "",
        subtitle: "",
        coverUrl: "",
        tags: [],
        selectedBlogAddress: "",
        sendNewsletter: true,
      };

      if (!draft) {
        return {
          details: defaultDetails,
          collecting: defaultCollecting,
        };
      }

      let collectingSettings = { ...defaultCollecting };
      if (draft.collectingSettings) {
        collectingSettings = {
          ...collectingSettings,
          ...draft.collectingSettings,
          collectLimit: draft.collectingSettings.collectLimit === 0 ? undefined : draft.collectingSettings.collectLimit,
          collectExpiryDays:
            draft.collectingSettings.collectExpiryDays === 0 ? undefined : draft.collectingSettings.collectExpiryDays,
          recipients: draft.collectingSettings.recipients ?? [],
        };
      }

      return {
        details: {
          title: draft.title || "",
          subtitle: draft.subtitle || "",
          coverUrl: draft.coverUrl || "",
          tags: draft.tags || [],
          selectedBlogAddress: draft.blogAddress || "",
          sendNewsletter: draft.publishingSettings?.sendNewsletter ?? true,
        },
        collecting: collectingSettings,
      };
    },
  });

  const { handleSubmit, formState, watch, trigger, getValues, setValue } = form;
  const { errors, isValid, isSubmitted, isLoading } = formState;
  const hasDetailsErrors = Object.keys(errors.details ?? {}).length > 0;
  const hasCollectingErrors = Object.keys(errors.collecting ?? {}).length > 0;

  useEffect(() => {
    if (!isLoading) {
      trigger();
    }
  }, [isLoading, trigger]);

  useEffect(() => {
    if (open && !isLoading) {
      const draft = getDraft();
      if (draft) {
        const currentDetails = getValues("details");
        let needsExtraction = false;

        if (!currentDetails.title) needsExtraction = true;
        if (!currentDetails.subtitle) needsExtraction = true;
        if (!currentDetails.coverUrl) needsExtraction = true;

        if (needsExtraction && draft.contentJson) {
          console.log("Extracting metadata...");
          const extracted = extractMetadata(draft.contentJson as any);
          let updated = false;

          if (!getValues("details.title") && extracted.title) {
            setValue("details.title", extracted.title, { shouldValidate: true, shouldDirty: false, shouldTouch: false });
            updated = true;
          }
          if (!getValues("details.subtitle") && extracted.subtitle) {
            setValue("details.subtitle", extracted.subtitle, { shouldValidate: true, shouldDirty: false, shouldTouch: false });
            updated = true;
          }
          if (!getValues("details.coverUrl") && extracted.coverUrl) {
            setValue("details.coverUrl", extracted.coverUrl, { shouldValidate: true, shouldDirty: false, shouldTouch: false });
            updated = true;
          }
          if (updated) {
            console.log("Applied extracted metadata to form.");
            trigger("details");
          }
        }
      }
    }
  }, [open, isLoading, getDraft, getValues, setValue, trigger]);

  useEffect(() => {
    const subscription = watch((values, { name, type }) => {
      if (!isLoading && values.details && values.collecting) {
        const currentDraft = getDraft();
        if (currentDraft) {
          const validTags = (values.details.tags ?? []).filter((tag): tag is string => typeof tag === "string");

          const selectedBlogAddress = values.details.selectedBlogAddress;
          const shouldSaveBlogAddress = selectedBlogAddress && !isUserBlog(selectedBlogAddress, blogState.blogs);

          const validRecipients = (values.collecting.recipients ?? []).filter(
            (r): r is { address: string; percentage: number; username?: string | null; picture?: string | null } =>
              r !== undefined && typeof r.address === "string" && typeof r.percentage === "number",
          );
          const updatedDraftData: Partial<Draft> = {
            title: values.details.title,
            subtitle: values.details.subtitle ?? null,
            coverUrl: values.details.coverUrl ?? null,
            tags: validTags,
            blogAddress: shouldSaveBlogAddress ? selectedBlogAddress : undefined,
            publishingSettings: {
              ...(currentDraft.publishingSettings || {}),
              sendNewsletter: values.details.sendNewsletter ?? true,
            },
            collectingSettings: {
              isCollectingEnabled: values.collecting.isCollectingEnabled ?? false,
              collectingLicense: values.collecting.collectingLicense ?? "CC BY-NC 4.0",
              isChargeEnabled: values.collecting.isChargeEnabled ?? false,
              isReferralRewardsEnabled: values.collecting.isReferralRewardsEnabled ?? false,
              referralPercent: values.collecting.referralPercent ?? 25,
              isRevenueSplitEnabled: values.collecting.isRevenueSplitEnabled ?? false,
              isLimitedEdition: values.collecting.isLimitedEdition ?? false,
              isCollectExpiryEnabled: values.collecting.isCollectExpiryEnabled ?? false,
              currency: values.collecting.currency ?? "GHO",
              price: values.collecting.price ?? "0",
              collectLimit: values.collecting.collectLimit ?? 0,
              collectExpiryDays: values.collecting.collectExpiryDays ?? 0,
              recipients: validRecipients,
            },
          };
          updateDraft({ ...currentDraft, ...updatedDraftData });
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [watch, isLoading, getDraft, updateDraft, blogState]);

  const onSubmit = async (data: CombinedFormValues) => {
    const draft = getDraft();
    if (!draft) return;

    const selectedBlogAddress = data.details.selectedBlogAddress;
    const shouldSaveBlogAddress = selectedBlogAddress && !isUserBlog(selectedBlogAddress, blogState.blogs);

    const finalDraft: Draft = {
      ...draft,
      title: data.details.title,
      subtitle: data.details.subtitle ?? null,
      coverUrl: data.details.coverUrl ?? null,
      tags: data.details.tags,
      blogAddress: shouldSaveBlogAddress ? selectedBlogAddress : undefined,
      publishingSettings: {
        ...(draft.publishingSettings || {}),
        sendNewsletter: data.details.sendNewsletter,
      },
      collectingSettings: {
        ...data.collecting,
        price: data.collecting.price ?? "0",
        collectLimit: data.collecting.collectLimit ?? 0,
        collectExpiryDays: data.collecting.collectExpiryDays ?? 0,
        recipients: data.collecting.recipients ?? [],
      },
    };

    console.log("Publishing with data:", finalDraft);

    try {
      setIsPublishing(true);
      await publishPost(finalDraft, walletClient, router, queryClient);
      setOpen(false);
    } catch (error) {
      console.error("Failed to publish:", error);
      toast.error("Publishing failed. Check console for details.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublishClick = () => {
    handleSubmit(onSubmit)();
  };

  if (!user) { return null; }

  if (isLoading) {
    return (
      <Button disabled className="transition-all duration-300">
        Publish
      </Button>
    );
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="transition-all duration-300">
        Publish
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <Form {...form}>
          <DialogContent className="max-w-[700px] h-[90vh] max-h-[800px] flex flex-col">
            <DialogHeader className="">
              <DialogTitle>Publish post</DialogTitle>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-fit grid-cols-2 max-w-fit my-2">
                <TabsTrigger
                  value="details"
                  className={cn(
                    "flex items-center gap-2 rounded-sm",
                    hasDetailsErrors && "text-destructive focus:text-destructive data-[state=active]:text-destructive",
                  )}
                >
                  {hasDetailsErrors ? <AlertCircleIcon className="w-4 h-4" /> : <PenIcon className="w-4 h-4" />}
                  Article Details
                </TabsTrigger>
                <TabsTrigger
                  value="monetization"
                  className={cn(
                    "flex items-center gap-2 rounded-sm",
                    hasCollectingErrors &&
                    "text-destructive focus:text-destructive data-[state=active]:text-destructive",
                  )}
                >
                  {hasCollectingErrors ? (
                    <AlertCircleIcon className="w-4 h-4" />
                  ) : (
                    <CircleDollarSignIcon className="w-4 h-4" />
                  )}
                  Monetization
                </TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1 min-h-0 pr-2">
                <TabsContent
                  value="details"
                  className="h-full m-0 data-[state=inactive]:hidden focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                >
                  <ArticleDetailsTab form={form} documentId={documentId} />
                </TabsContent>
                <TabsContent
                  value="monetization"
                  className="h-full m-0 data-[state=inactive]:hidden focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                >
                  <MonetizationTab form={form} documentId={documentId} />
                </TabsContent>
              </ScrollArea>
            </Tabs>
            <div className="flex items-center justify-start gap-2">
              <Button onClick={handlePublishClick} disabled={!isValid || isPublishing}>
                {isPublishing ? "Publishing..." : "Publish"}
              </Button>

              {!isValid && (isSubmitted || hasDetailsErrors || hasCollectingErrors) && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-4 w-4 shrink-0" />
                  Please fix the errors before publishing.
                </p>
              )}
            </div>
          </DialogContent>
        </Form>
      </Dialog>
    </>
  );
};

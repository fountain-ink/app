"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useWalletClient } from "wagmi";
import { PenIcon, ShoppingBag as ShoppingBagIcon, AlertCircleIcon, CircleDollarSignIcon, RefreshCw, SendIcon, RssIcon } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Form } from "@/components/ui/form";
import { ArticleDetailsTab, detailsFormSchema, DetailsFormValues } from "./publish-details-tab";
import { MonetizationTab, collectingFormSchema, CollectingFormValues } from "./publish-monetization-tab";
import { DistributionTab, distributionFormSchema, DistributionFormValues } from "./publish-distribution-tab";
import { publishPost } from "../../lib/publish/publish-post";
import { publishPostEdit } from "../../lib/publish/publish-post-edit";
import { usePublishDraft } from "../../hooks/use-publish-draft";
import { extractMetadata } from "@/lib/extract-metadata";
import { Draft } from "../draft/draft";
import { cn } from "@/lib/utils";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { useAuthenticatedUser } from "@lens-protocol/react";
import { Licenses } from "@/lib/licenses";

const isUserBlog = (blogAddress: string | undefined, blogs: any[]): boolean => {
  if (!blogAddress) return false;
  const blog = blogs.find((b) => b.address === blogAddress);
  return blog ? blog.address === blog.owner : false;
};

const combinedSchema = z.object({
  details: detailsFormSchema,
  distribution: distributionFormSchema,
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
  const draft = getDraft();
  const isEditMode = Boolean(draft?.published_id);

  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();

  const formToDraft = (values: CombinedFormValues, currentDraft: Draft | null, blogState: any): Partial<Draft> => {
    const selectedBlogAddress = values.distribution?.selectedBlogAddress || "";
    const shouldSaveBlogAddress = selectedBlogAddress && !isUserBlog(selectedBlogAddress, blogState.blogs);

    return {
      title: values.details.title || "",
      subtitle: values.details.subtitle || null,
      coverUrl: values.details.coverUrl || null,
      slug: values.details.slug || null,
      tags: Array.isArray(values.details.tags) ? values.details.tags : [],
      images: Array.isArray(values.details.images) ? values.details.images : [],
      originalDate: values.details.originalDate || null,
      isMiscSectionExpanded: values.details.isMiscSectionExpanded ?? false,

      distributionSettings: {
        selectedBlogAddress: shouldSaveBlogAddress ? selectedBlogAddress : undefined,
        sendNewsletter: Boolean(values.distribution.sendNewsletter),
        lensDisplay: values.distribution.lensDisplay || "title",
      },

      collectingSettings: {
        ...values.collecting,
        collectLimit: values.collecting.collectLimit ?? 0,
        collectExpiryDays: values.collecting.collectExpiryDays ?? 0,
        price: values.collecting.price || "1",
        referralPercent: values.collecting.referralPercent || 0,
        recipients: Array.isArray(values.collecting.recipients) ? values.collecting.recipients : [],
        collectingLicense: values.collecting.collectingLicense || Licenses.NoLicense,
      },
    };
  };

  const draftToFormDefaults = (draft: Draft | null): CombinedFormValues => {
    if (!draft) {
      return {
        details: {
          title: "",
          subtitle: "",
          coverUrl: "",
          slug: "",
          tags: [],
          images: [],
          isSlugManuallyEdited: false,
          originalDate: null,
          isMiscSectionExpanded: false,
        },
        distribution: {
          selectedBlogAddress: "",
          sendNewsletter: false,
          lensDisplay: "title_link",
        },
        collecting: {
          isCollectingEnabled: false,
          collectingLicense: Licenses.NoLicense,
          isChargeEnabled: false,
          price: "1",
          currency: "GHO",
          isReferralRewardsEnabled: false,
          referralPercent: 25,
          isRevenueSplitEnabled: false,
          recipients: [],
          isLimitedEdition: false,
          collectLimit: 1,
          isCollectExpiryEnabled: false,
          collectExpiryDays: 1,
        },
      };
    }

    return {
      details: {
        title: draft?.title || "",
        subtitle: draft?.subtitle,
        coverUrl: draft?.coverUrl,
        slug: draft?.slug || "",
        tags: draft?.tags || [],
        images: draft?.images || [],
        isSlugManuallyEdited: draft?.slug ? true : false,
        originalDate: draft?.originalDate ? new Date(draft.originalDate) : null,
        isMiscSectionExpanded: draft?.isMiscSectionExpanded ?? false,
      },
      distribution: {
        selectedBlogAddress: draft?.distributionSettings?.selectedBlogAddress || "",
        sendNewsletter: draft?.distributionSettings?.sendNewsletter || false,
        lensDisplay: draft?.distributionSettings?.lensDisplay || "title_link",
      },
      collecting: draft?.collectingSettings || {
        isCollectingEnabled: false,
        collectingLicense: Licenses.NoLicense,
        isChargeEnabled: false,
        price: "1",
        currency: "GHO",
        isReferralRewardsEnabled: false,
        referralPercent: 25,
        isRevenueSplitEnabled: false,
        recipients: [],
        isLimitedEdition: false,
        collectLimit: 1,
        isCollectExpiryEnabled: false,
        collectExpiryDays: 1,
      },
    };
  };

  const form = useForm<CombinedFormValues>({
    resolver: zodResolver(combinedSchema),
    mode: "onChange",
    defaultValues: async () => draftToFormDefaults(getDraft()),
  });

  const { handleSubmit, formState, watch, trigger, getValues, setValue } = form;
  const { errors, isValid, isSubmitted, isLoading } = formState;
  const hasDetailsErrors = Object.keys(errors.details ?? {}).length > 0;
  const hasDistributionErrors = Object.keys(errors.distribution ?? {}).length > 0;
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
          console.log("Extracted metadata:", extracted, draft.contentJson);
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
          if (extracted.images) {
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
    const subscription = watch((values: any, { name, type }: { name?: string; type?: string }) => {
      if (!isLoading && values.details && values.collecting && values.distribution) {
        const currentDraft = getDraft();
        if (currentDraft) {
          const updatedDraftData = formToDraft(values, currentDraft, blogState);
          updateDraft({ ...currentDraft, ...updatedDraftData });
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, isLoading, getDraft, updateDraft, blogState]);

  const onSubmit = async (data: CombinedFormValues) => {
    const draft = getDraft();
    if (!draft) return;

    const finalDraft: Draft = {
      ...draft,
      ...formToDraft(data, draft, blogState),
    };

    console.log(isEditMode ? "Updating post:" : "Publishing post:", finalDraft);

    try {
      setIsPublishing(true);

      const publishFn = isEditMode ? publishPostEdit : publishPost;
      const success = await publishFn(finalDraft, walletClient, router, queryClient);

      if (success) {
        setOpen(false);
      }
    } catch (error) {
      console.error(isEditMode ? "Failed to update post:" : "Failed to publish post:", error);
      toast.error(isEditMode ? "Update failed. Check console for details." : "Publishing failed. Check console for details.");
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
              <DialogTitle>{isEditMode ? "Update post" : "Publish post"}</DialogTitle>
            </DialogHeader>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              <TabsList className="grid w-fit grid-cols-3 max-w-fit my-2">
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
                <TabsTrigger
                  value="distribution"
                  className={cn(
                    "flex items-center gap-2 rounded-sm",
                    hasDistributionErrors &&
                    "text-destructive focus:text-destructive data-[state=active]:text-destructive",
                  )}
                >
                  {hasDistributionErrors ? (
                    <AlertCircleIcon className="w-4 h-4" />
                  ) : (
                    <RssIcon className="w-4 h-4 text-muted-foreground" />
                  )}
                  Distribution
                </TabsTrigger>
              </TabsList>
              <ScrollArea className="flex-1 min-h-0">
                <TabsContent
                  value="details"
                  className="h-full m-0 data-[state=inactive]:hidden focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                >
                  <ArticleDetailsTab
                    form={form}
                    documentId={documentId}
                  />
                </TabsContent>
                <TabsContent
                  value="distribution"
                  className="h-full m-0 data-[state=inactive]:hidden focus-visible:ring-0 focus-visible:ring-offset-0"
                  tabIndex={-1}
                >
                  <DistributionTab form={form} documentId={documentId} />
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
                {isPublishing
                  ? (isEditMode ? "Updating..." : "Publishing...")
                  : (isEditMode ? "Update Post" : "Publish")
                }
              </Button>

              {!isValid && (isSubmitted || hasDetailsErrors || hasDistributionErrors || hasCollectingErrors) && (
                <p className="text-sm text-destructive flex items-center gap-1">
                  <AlertCircleIcon className="h-4 w-4 shrink-0" />
                  Please fix the errors before {isEditMode ? "updating" : "publishing"}.
                </p>
              )}
            </div>
          </DialogContent>
        </Form>
      </Dialog>
    </>
  );
};

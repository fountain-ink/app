"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { getLensClient } from "@/lib/lens/client";
import { storageClient } from "@/lib/lens/storage-client";
import { TransactionIndexingError } from "@lens-protocol/client";
import { currentSession, fetchGroup, fetchPost, post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { MetadataAttributeType, article } from "@lens-protocol/metadata";
import { useQueryClient } from "@tanstack/react-query";
// import { serializeHtml } from "@udecode/plate-core";
import type { Tag } from "emblor";
import { dateTime, evmAddress, uri } from "@lens-protocol/client";
import { Value } from "@udecode/plate";
import { TagInput } from "emblor";
import { PenIcon, ShoppingBag, PlusIcon } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";
import { getStaticEditor, staticComponents } from "../editor/static";
import { useBlogStorage } from "@/hooks/use-blog-storage";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { BlogData } from "@/lib/settings/get-blog-data";
import { createClient } from "@/lib/supabase/client";
import { createCampaignForPost } from "@/lib/listmonk/newsletter";
import { BlogSelectMenu } from "@/components/blog/blog-select-menu";
import { Checkbox } from "@/components/ui/checkbox";

export const PublishMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [tab, setTab] = useState("article");
  const pathname = usePathname();
  const documentId = pathname.split("/").at(-1);
  const { getDocument, saveDocument } = useDocumentStorage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isConnected: isWalletConnected } = useAccount();
  const { data: walletClient } = useWalletClient();

  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [titleError, setTitleError] = useState<string | null>(null);
  const [tags, setTags] = useState<Tag[]>([]);
  const [activeTagIndex, setActiveTagIndex] = useState<number | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [blogs, setBlogs] = useState<BlogData[]>([]);
  const [selectedBlog, setSelectedBlog] = useState<BlogData | null>(null);
  const [sendNewsletter, setSendNewsletter] = useState(true);
  const { getBlogs } = useBlogStorage();

  // Collecting settings
  const [isCollectingEnabled, setIsCollectingEnabled] = useState(false);
  const [collectingLicense, setCollectingLicense] = useState("All rights reserved");
  const [isChargeEnabled, setIsChargeEnabled] = useState(false);
  const [price, setPrice] = useState("");
  const [currency, setCurrency] = useState(""); // For future implementation
  const [isReferralRewardsEnabled, setIsReferralRewardsEnabled] = useState(false);
  const [referralPercent, setReferralPercent] = useState(25);
  const [isRevenueSplitEnabled, setIsRevenueSplitEnabled] = useState(false);
  const [recipients, setRecipients] = useState<{ address: string; percent: number }[]>([]);
  const [recipientAddress, setRecipientAddress] = useState("");
  const [recipientPercent, setRecipientPercent] = useState("");
  const [isLimitedEdition, setIsLimitedEdition] = useState(false);
  const [collectLimit, setCollectLimit] = useState("");
  const [isCollectExpiryEnabled, setIsCollectExpiryEnabled] = useState(false);
  const [collectExpiryDays, setCollectExpiryDays] = useState(1);
  const [collectExpiryDate, setCollectExpiryDate] = useState("");

  const saveDraft = useCallback(
    (updates: Partial<any>) => {
      if (!documentId) return;

      const draft = getDocument(documentId);
      if (draft) {
        saveDocument(documentId, {
          ...draft,
          ...updates,
        });
      }
    },
    [documentId, getDocument, saveDocument],
  );

  useEffect(() => {
    if (isOpen) {
      getBlogs()
        .then((fetchedBlogs) => {
          setBlogs(fetchedBlogs || []);

          if (!selectedBlog && fetchedBlogs && fetchedBlogs.length > 0) {
            const personalBlog = fetchedBlogs.find(blog => blog.address === blog.owner);
            if (personalBlog) {
              setSelectedBlog(personalBlog);
              saveDraft({
                blog: personalBlog,
              });
            }
          }
        })
        .catch((error) => {
          console.error("Error fetching blogs:", error);
        });
    }
  }, [isOpen, getBlogs, selectedBlog, saveDraft]);

  useEffect(() => {
    if (isOpen && documentId) {
      const draft = getDocument(documentId);
      if (draft) {
        setTitle(draft.title || "");
        setSubtitle(draft.subtitle || "");
        setCoverUrl(draft.coverUrl || "");
        setTags((draft.tags || []).map((text: string) => ({ text, id: crypto.randomUUID() })));

        // Load selected blog from draft if available
        if (draft.blog && typeof draft.blog === 'object' && blogs.length > 0) {
          const savedBlog = blogs.find(blog => blog.address === draft.blog?.address);
          if (savedBlog) {
            setSelectedBlog(savedBlog);
          }
        }
      }
    }
  }, [isOpen, documentId, getDocument, blogs, saveDraft]);

  useEffect(() => {
    const error = validateTitle(title);
    setTitleError(error);
  }, [title]);

  useEffect(() => {
    // Set expiry date based on days
    if (isCollectExpiryEnabled) {
      const date = new Date();
      date.setDate(date.getDate() + collectExpiryDays);
      setCollectExpiryDate(date.toISOString());
    }
  }, [isCollectExpiryEnabled, collectExpiryDays]);

  const validateTitle = (value: string) => {
    if (!value.trim()) {
      return "Title is required";
    }
    if (value.length > 100) {
      return "Title must be less than 100 characters";
    }
    return null;
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setTitle(newTitle);
    saveDraft({ title: newTitle });
  };

  const handleSubtitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSubtitle = e.target.value;
    setSubtitle(newSubtitle);
    saveDraft({ subtitle: newSubtitle });
  };

  const handleTagsChange = useCallback(
    (newTags: Tag[]) => {
      setTags(newTags);
      saveDraft({ tags: newTags.map((t) => t.text) });
    },
    [saveDraft],
  );

  const handleSetTags = useCallback(
    (newTags: Tag[] | ((prev: Tag[]) => Tag[])) => {
      const resolvedTags = typeof newTags === "function" ? newTags(tags) : newTags;
      handleTagsChange(resolvedTags);
    },
    [handleTagsChange, tags],
  );

  const handleBlogChange = (value: string) => {
    const blog = blogs.find(blog => blog.address === value);
    if (blog) {
      setSelectedBlog(blog);
      // Save both formats for backward compatibility
      saveDraft({
        blog,
        blogAddress: blog.address
      });
    }
  };

  const isUserBlog = useCallback(() => {
    if (!selectedBlog) return false;
    return selectedBlog.address === selectedBlog.owner;
  }, [selectedBlog]);

  // Collecting settings handlers
  const handleAddRecipient = () => {
    if (!recipientAddress || !recipientPercent) return;

    const percent = Number.parseInt(recipientPercent);
    if (Number.isNaN(percent) || percent <= 0 || percent > 100) {
      toast.error("Percentage must be between 1 and 100");
      return;
    }

    // Check if total percentage exceeds 100%
    const totalPercent = recipients.reduce((sum, r) => sum + r.percent, 0) + percent;
    if (totalPercent > 100) {
      toast.error("Total percentage cannot exceed 100%");
      return;
    }

    setRecipients([...recipients, { address: recipientAddress, percent }]);
    setRecipientAddress("");
    setRecipientPercent("");

    saveDraft({
      collectingSettings: {
        ...getCollectingSettings(),
        recipients: [...recipients, { address: recipientAddress, percent }],
      },
    });
  };

  const handleRemoveRecipient = (index: number) => {
    const newRecipients = [...recipients];
    newRecipients.splice(index, 1);
    setRecipients(newRecipients);

    saveDraft({
      collectingSettings: {
        ...getCollectingSettings(),
        recipients: newRecipients,
      },
    });
  };

  const getCollectingSettings = () => {
    return {
      isCollectingEnabled,
      collectingLicense,
      isChargeEnabled,
      price,
      currency,
      isReferralRewardsEnabled,
      referralPercent,
      isRevenueSplitEnabled,
      recipients,
      isLimitedEdition,
      collectLimit,
      isCollectExpiryEnabled,
      collectExpiryDays,
      collectExpiryDate,
    };
  };

  // Load collecting settings from draft
  useEffect(() => {
    if (isOpen && documentId) {
      const draft = getDocument(documentId);
      if (draft?.collectingSettings) {
        const settings = draft.collectingSettings;
        setIsCollectingEnabled(settings.isCollectingEnabled ?? false);
        setCollectingLicense(settings.collectingLicense ?? "All rights reserved");
        setIsChargeEnabled(settings.isChargeEnabled ?? false);
        setPrice(settings.price ?? "");
        setCurrency(settings.currency ?? "");
        setIsReferralRewardsEnabled(settings.isReferralRewardsEnabled ?? false);
        setReferralPercent(settings.referralPercent ?? 25);
        setIsRevenueSplitEnabled(settings.isRevenueSplitEnabled ?? false);
        setRecipients(settings.recipients ?? []);
        setIsLimitedEdition(settings.isLimitedEdition ?? false);
        setCollectLimit(settings.collectLimit ?? "");
        setIsCollectExpiryEnabled(settings.isCollectExpiryEnabled ?? false);
        setCollectExpiryDays(settings.collectExpiryDays ?? 1);
        setCollectExpiryDate(settings.collectExpiryDate ?? "");
      }
    }
  }, [isOpen, documentId, getDocument]);

  const handlePublish = async () => {
    if (!documentId) {
      toast.error("Invalid document ID");
      return;
    }

    if (!isWalletConnected || !walletClient) {
      toast.error("Please connect your wallet and log in to publish");
      return;
    }

    const lens = await getLensClient();
    if (!lens.isSessionClient()) {
      toast.error("Please log in to publish");
      return;
    }

    const session = await currentSession(lens).unwrapOr(null);

    if (!session) {
      toast.error("Please log in to publish");
      return;
    }

    const draft = getDocument(documentId);
    if (!draft?.contentJson) {
      toast.error("No content found");
      return;
    }

    // const staticEditor = getStaticEditor(draft.contentJson as Value);

    setIsPublishing(true);

    try {
      /// FIXME
      // const contentHtml = await serializeHtml(staticEditor as any, {
      //   components: { ...staticComponents },
      // });

      const attributes: any = [
        { key: "contentJson", type: MetadataAttributeType.JSON, value: JSON.stringify(draft.contentJson) },
        // { key: "contentHtml", type: MetadataAttributeType.STRING, value: draft.contentHtml },
      ];

      if (subtitle) {
        attributes.push({ key: "subtitle", type: MetadataAttributeType.STRING, value: subtitle });
      }

      if (coverUrl) {
        attributes.push({ key: "coverUrl", type: MetadataAttributeType.STRING, value: coverUrl });
      }

      const metadata = article({
        title,
        content: draft.contentMarkdown ?? "",
        locale: "en",
        tags: tags.map((t) => t.text),
        attributes,
      });

      const { uri } = await storageClient.uploadAsJson(metadata);
      console.log(metadata, uri);
      const pendingToast = toast.loading("Publishing post...");

      let feedValue: string | undefined = undefined;

      if (selectedBlog && !isUserBlog()) {
        const blog = await fetchGroup(lens, {
          group: selectedBlog.address,
        });

        if (blog.isErr()) {
          toast.dismiss(pendingToast);
          toast.error("Failed to fetch blog data");
          setIsPublishing(false);
          return;
        }

        feedValue = blog.value?.feed ?? undefined;
      }

      console.log("feed is", feedValue);
      const result = await post(lens, {
        contentUri: uri,
        feed: feedValue,
        actions: isCollectingEnabled
          ? [
            {
              simpleCollect: {
                ...(isLimitedEdition && collectLimit ? { collectLimit: Number.parseInt(collectLimit) } : {}),
                ...(isCollectExpiryEnabled ? { endsAt: dateTime(collectExpiryDate) } : {}),
                ...(isChargeEnabled && price
                  ? {
                    amount: {
                      /// WGRASS
                      currency: evmAddress("0xeee5a340Cdc9c179Db25dea45AcfD5FE8d4d3eB8"),
                      value: price,
                    },
                  }
                  : {}),
                ...(isReferralRewardsEnabled ? { referralShare: referralPercent } : {}),
                ...(isRevenueSplitEnabled && recipients.length > 0
                  ? {
                    recipients: recipients.map((r) => ({
                      address: evmAddress(r.address),
                      percent: r.percent,
                    })),
                  }
                  : {}),
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
        setIsPublishing(false);
        return;
      }

      const hash = result.value;
      const postValue = await fetchPost(lens, { txHash: hash });

      if (postValue.isErr()) {
        toast.error(`Failed to fetch post: ${postValue.error.message}`);
        console.error("Failed to fetch post:", postValue.error);
        setIsPublishing(false);
        return;
      }

      const postSlug = postValue.value?.__typename === "Post" ? postValue.value.slug : postValue.value?.id;
      const username =
        postValue.value?.__typename === "Post" ? postValue.value.author.username?.localName : postValue.value?.id;

      if (selectedBlog && postSlug && username) {
        try {
          const db = await createClient();
          const { data: blog } = await db
            .from("blogs")
            .select("*")
            .eq("address", selectedBlog.address)
            .single();

          if (blog?.mail_list_id && sendNewsletter) {
            const postData = {
              title,
              subtitle,
              content: draft.contentMarkdown ?? '',
              coverUrl,
              username
            };

            try {
              const result = await createCampaignForPost(selectedBlog.address, postSlug, postData);

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

      toast.dismiss(pendingToast);
      toast.success("Post published successfully!");
      router.push(`/p/${username}/${postSlug}?success=true`);
      router.refresh();

      if (documentId) {
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
      }
    } catch (error) {
      console.error("Error creating post:", error);
      toast.error("An error occurred while creating the post. See console for details");
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <Button
        className="trasition-all duration-300"
        variant={isOpen ? "outline" : "default"}
        onClick={() => setIsOpen(true)}
        disabled={isPublishing}
      >
        {isPublishing ? "Publishing..." : "Publish"}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-[700px] h-[90vh] rounded-none flex flex-col">
          <div className="">
            <div className="flex items-center mb-2">
              <div className="text-lg font-semibold">
                {tab === "collecting" ? "Article Collecting" : "Publish Article"}
              </div>
            </div>
          </div>

          <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-fit grid-cols-2 max-w-full flex-shrink-0">
              <TabsTrigger value="article" className="flex items-center gap-2">
                <PenIcon className="w-4 h-4" />
                Article Details
              </TabsTrigger>
              <TabsTrigger value="collecting" className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                Collecting
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 min-h-0">
              <TabsContent value="article" className="h-full">
                <div className="flex flex-col h-full">
                  <ScrollArea className="flex-1 min-h-0 pr-2">
                    <div className="space-y-6 p-4 px-2">
                      <div className="space-y-2">
                        <div className="pb-2">
                          <h3 className="font-medium">Preview</h3>
                          <p className="text-sm text-muted-foreground">
                            You can change how the post will be shown on social media and your blog index.
                          </p>
                        </div>
                        <div className="border border-border rounded-lg p-4 space-y-4">
                          <div className="space-y-2">
                            <Label>Image</Label>
                            {coverUrl ? (
                              <div className="relative w-full rounded-lg overflow-hidden border border-border">
                                <img src={coverUrl} alt="Cover" className="w-full h-auto object-cover" />
                              </div>
                            ) : (
                              <div className="flex relative aspect-video w-full rounded-sm -z-[1]">
                                <div className="placeholder-background rounded-sm" />
                              </div>
                            )}
                          </div>
                          <div className="space-y-2 max-w-sm">
                            <Label htmlFor="title">Title</Label>
                            <div className="space-y-1">
                              <Input
                                id="title"
                                placeholder="Enter title"
                                value={title}
                                onChange={handleTitleChange}
                                className={titleError ? "border-destructive" : ""}
                              />
                              {titleError && <span className="text-sm text-destructive">{titleError}</span>}
                            </div>
                          </div>
                          <div className="space-y-2 max-w-md">
                            <Label htmlFor="subtitle">Summary</Label>
                            <Input
                              id="subtitle"
                              placeholder="Enter summary (optional)"
                              value={subtitle}
                              onChange={handleSubtitleChange}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="">
                        <Label>Publish in</Label>
                        <BlogSelectMenu
                          selectedBlogAddress={selectedBlog?.address || null}
                          onBlogChange={handleBlogChange}
                          placeholder="Select a blog to publish to"
                          className="max-w-sm mt-1"
                        />
                        {selectedBlog?.mail_list_id && (
                          <div className="flex flex-col space-y-1 mt-4 ml-4">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="sendNewsletter"
                                checked={sendNewsletter}
                                onCheckedChange={(checked) => {
                                  const value = checked as boolean;
                                  setSendNewsletter(value);
                                  saveDraft({
                                    publishingSettings: {
                                      sendNewsletter: value,
                                    },
                                  });
                                }}
                              />
                              <label
                                htmlFor="sendNewsletter"
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Send out newsletter to subscribers
                              </label>
                            </div>
                            <p className="text-xs text-muted-foreground pl-6">
                              Subscribers will receive this post in their inbox.
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2 max-w-full min-w-sm w-fit">
                        <Label>Tags</Label>
                        <TagInput
                          maxTags={5}
                          styleClasses={{
                            input: "shadow-none w-[200px] h-6",
                            tag: {
                              body: "border border-secondary",
                            },
                          }}
                          placeholder="Add a tag"
                          tags={tags}
                          setTags={handleSetTags}
                          activeTagIndex={activeTagIndex}
                          setActiveTagIndex={setActiveTagIndex}
                          variant="outline"
                        />
                      </div>
                    </div>
                  </ScrollArea>
                  <div className="flex items-center p-2 ">
                    <Button onClick={handlePublish} disabled={!!titleError || isPublishing}>
                      {isPublishing ? "Publishing..." : "Publish"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="collecting" className="h-full">
                <div className="flex flex-col h-full">
                  <ScrollArea className="flex-1 min-h-0 pr-2">
                    <div className="space-y-6 p-4 px-2">
                      <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                          Collecting to let readers mint your post as an NFT. You can also set a license for the piece,
                          and decide if you want to charge for the collect.
                        </p>
                      </div>

                      <div className="space-y-4 py-2 border-b">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-medium">Collecting</h3>
                            <p className="text-sm text-muted-foreground">Let users collect your post</p>
                          </div>
                          <Switch
                            checked={isCollectingEnabled}
                            onCheckedChange={(checked) => {
                              setIsCollectingEnabled(checked);
                              saveDraft({
                                collectingSettings: {
                                  ...getCollectingSettings(),
                                  isCollectingEnabled: checked,
                                },
                              });
                            }}
                          />
                        </div>
                      </div>

                      {isCollectingEnabled && (
                        <>
                          <div className="space-y-4 py-2 border-b">
                            <div className="space-y-2">
                              <Label>License</Label>
                              <Select
                                value={collectingLicense}
                                onValueChange={(value) => {
                                  setCollectingLicense(value);
                                  saveDraft({
                                    collectingSettings: {
                                      ...getCollectingSettings(),
                                      collectingLicense: value,
                                    },
                                  });
                                }}
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select a license" />
                                </SelectTrigger>
                                <SelectContent position="popper" sideOffset={5} className="z-[60]" side="bottom">
                                  <SelectItem value="All rights reserved">All rights reserved</SelectItem>
                                  <SelectItem value="CC BY">Attribution (CC BY)</SelectItem>
                                  <SelectItem value="CC BY-SA">Attribution-ShareAlike (CC BY-SA)</SelectItem>
                                  <SelectItem value="CC BY-NC">Attribution-NonCommercial (CC BY-NC)</SelectItem>
                                  <SelectItem value="CC BY-NC-SA">
                                    Attribution-NonCommercial-ShareAlike (CC BY-NC-SA)
                                  </SelectItem>
                                  <SelectItem value="CC BY-ND">Attribution-NoDerivs (CC BY-ND)</SelectItem>
                                  <SelectItem value="CC BY-NC-ND">
                                    Attribution-NonCommercial-NoDerivs (CC BY-NC-ND)
                                  </SelectItem>
                                  <SelectItem value="CC0">Public Domain (CC0)</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-sm text-muted-foreground">
                                You can grant the collector a license to use the post. By default you retain all rights.
                              </p>
                            </div>
                          </div>

                          <div className="space-y-4 py-2 border-b">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Charge for collecting</h3>
                                <p className="text-sm text-muted-foreground">
                                  Get paid in crypto when someone collects your post
                                </p>
                              </div>
                              <Switch
                                checked={isChargeEnabled}
                                onCheckedChange={(checked) => {
                                  setIsChargeEnabled(checked);
                                  saveDraft({
                                    collectingSettings: {
                                      ...getCollectingSettings(),
                                      isChargeEnabled: checked,
                                    },
                                  });
                                }}
                              />
                            </div>

                            {isChargeEnabled && (
                              <div className="space-y-2 max-w-xs">
                                <Label>Price</Label>
                                <div className="flex items-center">
                                  <span className="mr-2">$</span>
                                  <Input
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0.00"
                                    value={price}
                                    onChange={(e) => {
                                      setPrice(e.target.value);
                                      saveDraft({
                                        collectingSettings: {
                                          ...getCollectingSettings(),
                                          price: e.target.value,
                                        },
                                      });
                                    }}
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4 py-2 border-b">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Referral rewards</h3>
                                <p className="text-sm text-muted-foreground">
                                  Share a portion of you collect revenue with people who amplify your content
                                </p>
                              </div>
                              <Switch
                                checked={isReferralRewardsEnabled}
                                onCheckedChange={(checked) => {
                                  setIsReferralRewardsEnabled(checked);
                                  saveDraft({
                                    collectingSettings: {
                                      ...getCollectingSettings(),
                                      isReferralRewardsEnabled: checked,
                                    },
                                  });
                                }}
                              />
                            </div>

                            {isReferralRewardsEnabled && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    max="100"
                                    className="w-16"
                                    value={referralPercent}
                                    onChange={(e) => {
                                      const value = Number.parseInt(e.target.value);
                                      if (!Number.isNaN(value) && value >= 1 && value <= 100) {
                                        setReferralPercent(value);
                                        saveDraft({
                                          collectingSettings: {
                                            ...getCollectingSettings(),
                                            referralPercent: value,
                                          },
                                        });
                                      }
                                    }}
                                  />
                                  <span>%</span>
                                </div>
                                <Slider
                                  value={[referralPercent]}
                                  min={1}
                                  max={100}
                                  step={1}
                                  onValueChange={(value) => {
                                    if (value[0] !== undefined) {
                                      setReferralPercent(value[0]);
                                      saveDraft({
                                        collectingSettings: {
                                          ...getCollectingSettings(),
                                          referralPercent: value[0],
                                        },
                                      });
                                    }
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          <div className="space-y-4 py-2 border-b">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Revenue split</h3>
                                <p className="text-sm text-muted-foreground">Share your collect revenue with others</p>
                              </div>
                              <Switch
                                checked={isRevenueSplitEnabled}
                                onCheckedChange={(checked) => {
                                  setIsRevenueSplitEnabled(checked);
                                  saveDraft({
                                    collectingSettings: {
                                      ...getCollectingSettings(),
                                      isRevenueSplitEnabled: checked,
                                    },
                                  });
                                }}
                              />
                            </div>

                            {isRevenueSplitEnabled && (
                              <div className="space-y-4 max-w-md">
                                {recipients.length > 0 && (
                                  <div className="space-y-2">
                                    {recipients.map((recipient, index) => (
                                      <div key={index} className="flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                          <span className="text-sm truncate max-w-[200px]">{recipient.address}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                          <span>{recipient.percent}%</span>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveRecipient(index)}
                                          >
                                            Remove
                                          </Button>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                <div className="grid grid-cols-[1fr,auto] gap-2">
                                  <div>
                                    <Label>Recipient</Label>
                                    <Input
                                      placeholder="@username or 0x address..."
                                      value={recipientAddress}
                                      onChange={(e) => setRecipientAddress(e.target.value)}
                                    />
                                  </div>
                                  <div>
                                    <Label>Percent</Label>
                                    <div className="flex items-center gap-2">
                                      <Input
                                        type="number"
                                        min="1"
                                        max="100"
                                        className="w-16"
                                        value={recipientPercent}
                                        onChange={(e) => setRecipientPercent(e.target.value)}
                                      />
                                      <span>%</span>
                                    </div>
                                  </div>
                                </div>
                                <Button variant="outline" size="sm" className="w-full" onClick={handleAddRecipient}>
                                  <PlusIcon className="w-4 h-4 mr-2" />
                                  Add recipient
                                </Button>
                              </div>
                            )}
                          </div>

                          <div className="space-y-4 py-2 border-b">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Limited edition</h3>
                                <p className="text-sm text-muted-foreground">Only allow a certain number of collects</p>
                              </div>
                              <Switch
                                checked={isLimitedEdition}
                                onCheckedChange={(checked) => {
                                  setIsLimitedEdition(checked);
                                  saveDraft({
                                    collectingSettings: {
                                      ...getCollectingSettings(),
                                      isLimitedEdition: checked,
                                    },
                                  });
                                }}
                              />
                            </div>

                            {isLimitedEdition && (
                              <div className="space-y-2 max-w-[200px]">
                                <Label>Maximum collects</Label>
                                <Input
                                  type="number"
                                  min="1"
                                  placeholder="100"
                                  value={collectLimit}
                                  onChange={(e) => {
                                    setCollectLimit(e.target.value);
                                    saveDraft({
                                      collectingSettings: {
                                        ...getCollectingSettings(),
                                        collectLimit: e.target.value,
                                      },
                                    });
                                  }}
                                />
                              </div>
                            )}
                          </div>

                          <div className="space-y-4 py-2">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-medium">Collect expiry</h3>
                                <p className="text-sm text-muted-foreground">
                                  Only allow collecting until a certain time
                                </p>
                              </div>
                              <Switch
                                checked={isCollectExpiryEnabled}
                                onCheckedChange={(checked) => {
                                  setIsCollectExpiryEnabled(checked);
                                  saveDraft({
                                    collectingSettings: {
                                      ...getCollectingSettings(),
                                      isCollectExpiryEnabled: checked,
                                    },
                                  });
                                }}
                              />
                            </div>

                            {isCollectExpiryEnabled && (
                              <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="number"
                                    min="1"
                                    className="w-16"
                                    value={collectExpiryDays}
                                    onChange={(e) => {
                                      const value = Number.parseInt(e.target.value);
                                      if (!Number.isNaN(value) && value >= 1) {
                                        setCollectExpiryDays(value);
                                        saveDraft({
                                          collectingSettings: {
                                            ...getCollectingSettings(),
                                            collectExpiryDays: value,
                                          },
                                        });
                                      }
                                    }}
                                  />
                                  <span>days</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  Expires on {new Date(collectExpiryDate).toLocaleDateString()}{" "}
                                  {new Date(collectExpiryDate).toLocaleTimeString()}
                                </p>
                              </div>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  </ScrollArea>
                  <div className="flex items-center p-2">
                    <Button onClick={handlePublish} disabled={!!titleError || isPublishing}>
                      {isPublishing ? "Publishing..." : "Publish"}
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

"use client";

import { getElements } from "@/components/editor/elements";
import { staticPlugins } from "@/components/editor/plugins";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDocumentStorage } from "@/hooks/use-document-storage";
import { getLensClient } from "@/lib/lens/client";
import { storageClient } from "@/lib/lens/storage-client";
import { Json } from "@/lib/supabase/database";
import { TransactionIndexingError } from "@lens-protocol/client";
import { currentSession, fetchPost, post } from "@lens-protocol/client/actions";
import { handleOperationWith } from "@lens-protocol/client/viem";
import { MetadataAttributeType, article } from "@lens-protocol/metadata";
import { useQueryClient } from "@tanstack/react-query";
import { serializeHtml } from "@udecode/plate-core";
import { createPlateEditor } from "@udecode/plate/react";
import type { Tag } from "emblor";

import { TagInput } from "emblor";
import { PenIcon, ShoppingBag } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { toast } from "sonner";
import { useAccount, useWalletClient } from "wagmi";

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

  useEffect(() => {
    if (isOpen && documentId) {
      const draft = getDocument(documentId);
      if (draft) {
        setTitle(draft.title || "");
        setSubtitle(draft.subtitle || "");
        setCoverUrl(draft.coverUrl || "");
        setTags((draft.tags || []).map((text: string) => ({ text, id: crypto.randomUUID() })));
      }
    }
  }, [isOpen, documentId, getDocument]);

  useEffect(() => {
    const error = validateTitle(title);
    setTitleError(error);
  }, [title]);

  const validateTitle = (value: string) => {
    if (!value.trim()) {
      return "Title is required";
    }
    if (value.length > 100) {
      return "Title must be less than 100 characters";
    }
    return null;
  };

  // Save changes back to draft
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

  const editor = useMemo(() => {
    return createPlateEditor({
      plugins: staticPlugins?.filter((plugin: any) => plugin?.key !== "toggle" && plugin?.key !== "blockSelection"),
      override: { components: getElements() },
    });
  }, []);

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

    setIsPublishing(true);

    try {
      editor.children = draft.contentJson as any;

      const contentHtml = await serializeHtml(editor, {
        components: getElements(),
        // editorComponent: StaticEditor
        stripDataAttributes: true,
        preserveClassNames: [],
      });

      const contentMarkdown = editor.api.markdown.serialize();
      const attributes: any = [
        { key: "contentJson", type: MetadataAttributeType.JSON, value: JSON.stringify(draft.contentJson) },
        { key: "contentHtml", type: MetadataAttributeType.STRING, value: contentHtml },
      ];

      if (subtitle) {
        attributes.push({ key: "subtitle", type: MetadataAttributeType.STRING, value: subtitle });
      }

      if (coverUrl) {
        attributes.push({ key: "coverUrl", type: MetadataAttributeType.STRING, value: coverUrl });
      }

      const metadata = article({
        title,
        content: contentMarkdown,
        // attachments: coverUrl ? [{item: coverUrl, type: MediaImageMimeType.JPEG, attributes: [{key: "cover", }]}] : [],
        locale: "en",
        tags: tags.map((t) => t.text),
        attributes,
      });

      const { uri } = await storageClient.uploadAsJson(metadata);
      console.log(uri);
      const pendingToast = toast.loading("Publishing post...");

      const result = await post(lens, {
        contentUri: uri,
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

      toast.dismiss(pendingToast);
      toast.success("Post published successfully!");
      router.push(`/p/${username}/${postSlug}?success=true`);
      router.refresh();

      // Clean up draft
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
                  <ScrollArea className="flex-1 min-h-0 pr-[10%]">
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
                          <div className="space-y-2">
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
                          <div className="space-y-2">
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

                      <div className="space-y-2">
                        <Label>Tags</Label>
                        <TagInput
                          maxTags={5}
                          styleClasses={{
                            input: "shadow-none h-6",
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
                {/* TODO: Add collecting settings */}
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

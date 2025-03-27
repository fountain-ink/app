"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useWalletClient } from "wagmi";
import { PenIcon, ShoppingBag } from "lucide-react";
import { ArticleDetailsTab } from "./publish-details-tab";
import { CollectingTab } from "./publish-collecting-tab";
import { publishPost } from "../../lib/publish/publish-post";
import { usePublishDraft } from "../../hooks/use-publish-draft";

interface PublishMenuProps {
  documentId: string;
}

export const PublishMenu = ({ documentId }: PublishMenuProps) => {
  const [open, setOpen] = useState(false);
  const { getDraft } = usePublishDraft(documentId);
  const [isPublishing, setIsPublishing] = useState(false);
  const [activeTab, setActiveTab] = useState("details");

  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();


  const handlePublish = async () => {
    const draft = getDraft();
    if (!draft) return;

    try {
      setIsPublishing(true);
      await publishPost(draft, walletClient, router, queryClient);
      setOpen(false);
    } catch (error) {
      console.error("Failed to publish:", error);
    } finally {
      setIsPublishing(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        disabled={isPublishing}
        className="transition-all duration-300"
      >
        {isPublishing ? "Publishing..." : "Publish"}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[700px] h-[90vh] max-h-[800px] flex flex-col">
          <DialogHeader className="">
            <DialogTitle>Publish post</DialogTitle>
          </DialogHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
            <TabsList className="grid w-fit grid-cols-2 max-w-fit my-2">
              <TabsTrigger value="details" className="flex items-center gap-2 rounded-sm">
                <PenIcon className="w-4 h-4" />
                Article Details
              </TabsTrigger>
              <TabsTrigger value="collecting" className="flex items-center gap-2 rounded-sm">
                <ShoppingBag className="w-4 h-4" />
                Collecting
              </TabsTrigger>
            </TabsList>
            <div className="flex-1 min-h-0">
              <TabsContent value="details" className="h-full m-0 data-[state=inactive]:hidden">
                <ArticleDetailsTab
                  documentId={documentId}
                  isPublishing={isPublishing}
                  handlePublish={handlePublish}
                />
              </TabsContent>
              <TabsContent value="collecting" className="h-full m-0 data-[state=inactive]:hidden">
                <CollectingTab
                  documentId={documentId}
                  isPublishing={isPublishing}
                  handlePublish={handlePublish}
                />
              </TabsContent>
            </div>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
};

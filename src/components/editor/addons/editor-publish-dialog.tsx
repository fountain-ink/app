"use client";

import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePublishStore } from "@/hooks/use-publish-store";
import { PenIcon, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { CollectingTab } from "./publish-tabs/collecting-tab";
import { DetailsTab } from "./publish-tabs/details-tab";

export const PublishDialog = () => {
  const { isOpen, setIsOpen } = usePublishStore();
  const [tab, setTab] = useState("article");

  return (
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
              <DetailsTab />
            </TabsContent>
            <TabsContent value="collecting" className="h-full">
              <CollectingTab />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

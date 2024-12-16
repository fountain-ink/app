"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePublishStore } from "@/hooks/use-publish-store";
import { usePlateStore } from "@udecode/plate-common/react";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, PenIcon, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { PublishButton } from "./editor-publish-button";
import { CollectingTab } from "./publish-tabs/collecting-tab";
import { PreviewTab } from "./publish-tabs/preview-tab";
import { DetailsTab } from "./publish-tabs/details-tab";

export const PublishDialog = () => {
  const { isOpen, setIsOpen } = usePublishStore();
  const [tab, setTab] = useState("article");
  const isPreview = tab === "preview";
  const setReadOnly = usePlateStore().set.readOnly();

  useEffect(() => {
    setReadOnly(isPreview && isOpen);
  }, [isPreview, isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {!isPreview && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background z-[100]"
              onClick={() => setIsOpen(false)}
            />
          )}
          {isOpen && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                position: "fixed",
                top: isPreview ? "auto" : "50%",
                left: "50%",
                bottom: isPreview ? "0" : "auto",
                width: "min(600px, 95vw)",
                x: "-50%",
                y: isPreview ? "100%" : "-50%",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                height: isPreview ? "200px" : "min(800px, 80vh)",
                position: "fixed",
                top: isPreview ? "auto" : "50%",
                left: "50%",
                bottom: isPreview ? "10px" : "auto",
                width: "min(600px, 95vw)",
                x: "-50%",
                y: isPreview ? 0 : "-50%",
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: isPreview ? "100%" : "-50%",
              }}
              transition={{
                type: "spring",
                bounce: 0.2,
              }}
              layout
              className="bg-background border border-border rounded-lg shadow-lg z-[101] mx-auto overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 h-full w-full flex flex-col">
                <div className="flex-shrink-0">
                  <div className="text-lg font-semibold mb-6">
                    {tab === "preview" && "Preview Article"}
                    {tab === "collecting" && "Article Collecting"}
                    {tab === "article" && "Article Details"}
                  </div>
                </div>

                <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
                  <TabsList className="grid w-fit grid-cols-3 mx-auto max-w-full flex-shrink-0">
                    <TabsTrigger value="article" className="flex items-center gap-2">
                      <PenIcon className="w-4 h-4" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="collecting" className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Collecting
                    </TabsTrigger>
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </TabsTrigger>
                  </TabsList>
                  <ScrollArea className="flex-1 -mx-6">
                    <TabsContent value="article" className="space-y-4 px-6">
                      <DetailsTab />
                    </TabsContent>
                    <TabsContent value="collecting" className="space-y-6 px-6">
                      <CollectingTab />
                    </TabsContent>
                    <TabsContent value="preview" className="space-y-4 px-6">
                      <PreviewTab />
                    </TabsContent>
                  </ScrollArea>
                </Tabs>

                <div className="flex items-center justify-between flex-shrink-0">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsOpen(false);
                      setReadOnly(false);
                    }}
                  >
                    Back
                  </Button>

                  <PublishButton />
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

"use client";

import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePublishStore } from "@/hooks/use-publish-store";
import { AnimatePresence, motion } from "framer-motion";
import { PenIcon, ShoppingBag, X } from "lucide-react";
import { useState } from "react";
import { CollectingTab } from "./publish-tabs/collecting-tab";
import { DetailsTab } from "./publish-tabs/details-tab";

export const PublishDialog = () => {
  const { isOpen, setIsOpen } = usePublishStore();
  const [tab, setTab] = useState("article");

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-[100]"
            onClick={() => setIsOpen(false)}
          />
          {isOpen && (
            <motion.div
              initial={{
                opacity: 0,
                scale: 0.95,
                position: "fixed",
                top: "50%",
                left: "50%",
                width: "min(700px, 95vw)",
                x: "-50%",
                y: "-50%",
              }}
              animate={{
                opacity: 1,
                scale: 1,
                height: "min(800px, 80vh)",
                position: "fixed",
                top: "50%",
                left: "50%",
                width: "min(700px, 95vw)",
                x: "-50%",
                y: "-50%",
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
                y: "-50%",
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
                  <div className="flex justify-between items-center mb-6">
                    <div className="text-lg font-semibold">
                      {tab === "collecting" ? "Article Collecting" : "Article Details"}
                    </div>
                    <button
                      onClick={() => setIsOpen(false)}
                      type="button"
                      className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>

                <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col">
                  <TabsList className="grid w-fit grid-cols-2 max-w-full flex-shrink-0">
                    <TabsTrigger value="article" className="flex items-center gap-2">
                      <PenIcon className="w-4 h-4" />
                      Details
                    </TabsTrigger>
                    <TabsTrigger value="collecting" className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Collecting
                    </TabsTrigger>
                  </TabsList>
                  <ScrollArea className="flex-1 -mx-6">
                    <TabsContent value="article" className="space-y-4 px-6">
                      <DetailsTab />
                    </TabsContent>
                    <TabsContent value="collecting" className="space-y-6 px-6">
                      <CollectingTab />
                    </TabsContent>
                  </ScrollArea>
                </Tabs>
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

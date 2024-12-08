"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { usePublishStore } from "@/hooks/use-publish-store";
import { AnimatePresence, motion } from "framer-motion";
import { Eye, PenIcon, ShoppingBag } from "lucide-react";
import { useEffect, useState } from "react";
import { PublishButton } from "./editor-publish-button";

export const PublishDialog = () => {
  const { isOpen, setIsOpen } = usePublishStore();
  const [tab, setTab] = useState("article");
  const [isCollectingEnabled, setIsCollectingEnabled] = useState(false);
  const isPreview = tab === "preview";

  const handleBack = () => {
    setTab("article");
  };

  useEffect(() => {
    console.log("tab", tab);
  }, [tab]);

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
              className="bg-background border rounded-lg shadow-lg z-[101] mx-auto overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 h-full w-full flex flex-col">
                <div>
                  {isPreview ? (
                    <h2 className="text-lg font-semibold">Preview Article</h2>
                  ) : (
                    <h2 className="text-lg font-semibold">Publish Article</h2>
                  )}
                </div>
                <Tabs value={tab} onValueChange={setTab} className="flex-1">
                  <TabsList className="grid w-fit grid-cols-3 mx-auto max-w-full">
                    <TabsTrigger value="preview" className="flex items-center gap-2">
                      <Eye className="w-4 h-4" />
                      Preview
                    </TabsTrigger>
                    <TabsTrigger value="collecting" className="flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4" />
                      Collecting
                    </TabsTrigger>
                    <TabsTrigger value="article" className="flex items-center gap-2">
                      <PenIcon className="w-4 h-4" />
                      Article
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="article" className="space-y-4">
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="title">Title</Label>
                        <Input id="title" placeholder="Enter article title" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subtitle">Subtitle</Label>
                        <Input id="subtitle" placeholder="Enter article subtitle" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="cover">Cover Image URL</Label>
                        <Input id="cover" placeholder="Enter cover image URL" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="tags">Tags</Label>
                        <Input id="tags" placeholder="Enter tags separated by commas" />
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="collecting" className="space-y-6">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="collecting">Enable Collecting</Label>
                          <div className="text-sm text-muted-foreground">Allow users to collect this post</div>
                        </div>
                        <Switch
                          id="collecting"
                          checked={isCollectingEnabled}
                          onCheckedChange={setIsCollectingEnabled}
                        />
                      </div>

                      {isCollectingEnabled && (
                        <div className="space-y-6 pt-4">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="charge">Charge for collecting</Label>
                              <div className="text-sm text-muted-foreground">
                                Get paid whenever someone collects your post
                              </div>
                            </div>
                            <Switch id="charge" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="exclusive">Exclusive content</Label>
                              <div className="text-sm text-muted-foreground">Make collects limited edition</div>
                            </div>
                            <Switch id="exclusive" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="timeLimit">Time limit</Label>
                              <div className="text-sm text-muted-foreground">
                                Limit collecting to specific period of time
                              </div>
                            </div>
                            <Switch id="timeLimit" />
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <Label htmlFor="exclusivity">Exclusivity</Label>
                              <div className="text-sm text-muted-foreground">Only followers can collect</div>
                            </div>
                            <Switch id="exclusivity" />
                          </div>
                        </div>
                      )}
                    </div>
                  </TabsContent>

                  <TabsContent value="preview" className="space-y-4">
                    <div className="h-full" />
                  </TabsContent>
                </Tabs>
                {!isPreview && (
                  <div className="flex items-center justify-between mt-6 pt-6">
                    <Button variant="outline" onClick={() => setIsOpen(false)}>
                      Back
                    </Button>
                    <PublishButton />
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </>
      )}
    </AnimatePresence>
  );
};

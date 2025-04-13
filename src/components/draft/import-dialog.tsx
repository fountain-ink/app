"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createHtmlDraft } from "@/lib/plate/create-html-draft";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { DownloadIcon, ImportIcon } from "lucide-react";

export function ImportDialog() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const handleImport = async () => {
    if (!url.trim()) {
      toast.error("Please enter a valid URL");
      return;
    }

    setIsLoading(true);

    try {
      console.log("Importing from URL:", url);

      const response = await fetch(`/api/import?url=${encodeURIComponent(url)}`);

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to import content");
      }

      const data = await response.json();
      console.log("Imported content:", data);

      const result = await createHtmlDraft(data.content, data.title, data.subtitle, data.coverImageUrl);
      console.log("Draft created with ID:", result.documentId);

      toast.success("Content imported successfully!");
      setIsOpen(false);

      router.push(`/write/${result.documentId}`);
    } catch (error) {
      console.error("Import failed:", error);
      toast.error(error instanceof Error ? error.message : "Failed to import content");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="flex items-center gap-2">
          <DownloadIcon className="w-4 h-4" />
          Import
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[640px]">
        <DialogHeader>
          <DialogTitle className="h-8 flex items-center">Import Content</DialogTitle>
          <DialogDescription>
            Import your content from Paragraph, T2 or Mirror by entering your article URL.
          </DialogDescription>
        </DialogHeader>
        <div className="flex gap-4">
          <div className="flex items-center w-full flex-row gap-4">
            <Label htmlFor="url" className="text-right">
              URL
            </Label>
            <Input
              id="url"
              placeholder="https://paragraph.com/..."
              className="flex w-full"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          <b>Note:</b> By importing content, you acknowledge that you have the right to import and use it.
        </p>
        <DialogFooter>
          <Button
            type="submit"
            onClick={handleImport}
            disabled={isLoading}
          >
            {isLoading ? "Importing..." : "Import"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 
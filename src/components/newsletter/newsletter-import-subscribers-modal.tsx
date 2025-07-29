"use client";

import { UploadIcon } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { importNewsletterSubscribers } from "@/lib/listmonk/newsletter";
import { cn } from "@/lib/utils";

interface ImportSubscribersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  blogAddress: string;
  onSuccess?: () => void;
}

export function ImportSubscribersModal({ open, onOpenChange, blogAddress, onSuccess }: ImportSubscribersModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.type !== "text/csv" && !selectedFile.name.endsWith(".csv")) {
      toast.error("Please select a valid CSV file");
      return;
    }
    setFile(selectedFile);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleImport = async () => {
    if (!file) {
      toast.error("Please select a CSV file to import");
      return;
    }

    setIsUploading(true);

    try {
      const result = await importNewsletterSubscribers(blogAddress, file);

      if (!result || result.error) {
        throw new Error(result?.error || "Failed to import subscribers");
      }

      const importedCount = (result.data as any)?.imported || 0;
      const skippedCount = (result.data as any)?.skipped || 0;

      toast.success(
        `Successfully imported ${importedCount} subscriber${importedCount !== 1 ? 's' : ''}${skippedCount > 0 ? ` (${skippedCount} inactive skipped)` : ''
        }`
      );

      setFile(null);
      onOpenChange(false);

      // Wait 2 seconds for the user to see the success message
      setTimeout(() => {
        window.location.reload();
      }, 2000);
    } catch (error) {
      console.error("Error importing subscribers:", error);
      toast.error(error instanceof Error ? error.message : "Failed to import subscribers");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Subscribers</DialogTitle>
          <DialogDescription>
            Upload a CSV file containing email addresses to import as subscribers. Make sure you have permission to add
            these emails to your newsletter.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div
            className={cn(
              "flex flex-col items-center justify-center gap-4 rounded-lg border border-dashed p-6 transition-colors",
              isDragging && "border-primary bg-primary/5",
            )}
            onDragOver={handleDragOver}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon
              className={cn("h-8 w-8 transition-colors", isDragging ? "text-primary" : "text-muted-foreground")}
            />
            <div className="text-center">
              <p className="text-sm font-medium truncate max-w-[200px]">
                {file ? file.name : "Drag and drop your CSV file here"}
              </p>
              <p className="text-xs text-muted-foreground mt-1">Your CSV should have an "email" column</p>
            </div>
            <Input type="file" accept=".csv" onChange={handleFileChange} className="max-w-xs" />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleImport} disabled={!file || isUploading}>
            {isUploading ? "Importing..." : "Import Subscribers"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

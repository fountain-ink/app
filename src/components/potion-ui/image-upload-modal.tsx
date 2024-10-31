import { Icons } from "@/components/icons";
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./dialog";
import { uploadFile } from "@/lib/upload-image";
import { UploadIcon } from "lucide-react";

interface ImageUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImageUploaded: (url: string) => void;
}

export function ImageUploadModal({ open, onOpenChange, onImageUploaded }: ImageUploadModalProps) {
  const [isUploading, setIsUploading] = React.useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const url = await uploadFile(file);
      if (url) {
        onImageUploaded(url);
        onOpenChange(false);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Upload Image</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center gap-4">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className={`flex h-32 w-full cursor-pointer items-center justify-center rounded-lg border border-dashed border-gray-300 hover:border-gray-400
                ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
            >
              {isUploading ? (
                <Icons.spinner className="size-6 animate-spin" />
              ) : (
                <div className="text-center">
                  <UploadIcon className="mx-auto size-6" />
                  <span className="mt-2 block text-sm text-gray-600">
                    Click to upload an image
                  </span>
                </div>
              )}
            </label>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

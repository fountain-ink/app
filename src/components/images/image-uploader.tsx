"use client";
import { UploadIcon } from "lucide-react";

import { useRef, useState } from "react";
import { Label } from "../ui/label";

export const getIpfsImageUrl = (uri: string | undefined): string => {
  if (!uri) return "";
  return uri.startsWith("ipfs://") ? `https://fountain.4everland.link/ipfs/${uri.slice(7)}` : uri;
};

interface ImageUploaderProps {
  label: string;
  initialImage: string;
  aspectRatio: number;
  onImageChange: (newImage: File | null) => void;
}

export const ImageUploader = ({ label, initialImage, aspectRatio, onImageChange }: ImageUploaderProps) => {
  const [image, setImage] = useState(initialImage);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageDelete = () => {
    setImage("");
    setLocalImage(null);
    onImageChange(null);
  };

  const handleFileSelection = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const localUrl = URL.createObjectURL(file);
      setLocalImage(localUrl);
      onImageChange(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };
  

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Label>{label}</Label>
        {(localImage || image) && (
          <span
            className="text-sm text-muted-foreground cursor-pointer hover:text-red-700"
            onClick={(e) => {
              e.stopPropagation();
              handleImageDelete();
            }}
          >
            remove
          </span>
        )}
      </div>

      <div
        className={`relative ${
          aspectRatio === 1 ? "w-48 h-48 rounded-full" : "w-full h-48 rounded-lg"
        } overflow-hidden cursor-pointer`}
        onClick={handleImageClick}
        onKeyDown={handleImageClick}
      >
        {localImage || image ? (
          <img src={localImage || getIpfsImageUrl(image)} alt={""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full relative flex items-center justify-center">
            <div className="flex  absolute gap-1 text-muted-foreground items-center justify-center">
              <UploadIcon className="size-5 mr-2" />
              <span>Upload Image</span>
            </div>

            <div className="placeholder-background rounded-sm" />
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelection} className="hidden" />
    </div>
  );
};

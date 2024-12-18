"use client";
import { UploadIcon, XIcon } from "lucide-react";

import { useRef, useState } from "react";

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
    <span>
      <div
        className={`relative ${
          aspectRatio === 1 ? "w-40 h-40 rounded-full" : "w-full h-44 rounded-lg"
        } overflow-hidden cursor-pointer ring-2 ring-background `}
        onClick={handleImageClick}
        onKeyDown={handleImageClick}
      >
        {localImage || image ? (
          <>
            <img src={localImage || getIpfsImageUrl(image)} alt={""} className="w-full h-full object-cover" />
            {(localImage || image) && (
              <div
                className="absolute inset-0 w-10 h-10 mx-auto my-auto flex items-center justify-center bg-black/50 hover:bg-black/70 p-1.5 rounded-full cursor-pointer transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  handleImageDelete();
                }}
              >
                <XIcon className="size-4 text-white" />
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full relative bg-background flex group items-center justify-center">
            <div className="flex absolute gap-1 text-sm text-muted-foreground group-hover:text-accent-foreground items-center justify-center">
              <UploadIcon className="size-4 mr-2" />
              <span>Upload {label}</span>
            </div>

            <div className="placeholder-background " />
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelection} className="hidden" />
    </span>
  );
};

import { uploadFile } from "@/lib/upload-utils";

import { useRef, useState } from "react";
import { Button } from "../ui/button";

import { Label } from "../ui/label";

const getImageUrl = (uri: string | undefined): string => {
  if (!uri) return "";
  return uri.startsWith("ipfs://") ? `https://fountain.4everland.link/ipfs/${uri.slice(7)}` : uri;
};

interface ImageUploaderProps {
  label: string;
  initialImage: string;
  aspectRatio: number;
  handle: string;
  onImageChange: (newImage: string) => void;
}

export const ImageUploader = ({ label, initialImage, aspectRatio, handle, onImageChange }: ImageUploaderProps) => {
  const [image, setImage] = useState(initialImage);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageDelete = () => {
    setImage("");
    onImageChange("");
  };

  const handleUploadNewImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const formData = new FormData();
      formData.append("file", file);
      formData.append("handle", handle);

      const uploadedUri = await uploadFile(formData);
      setImage(uploadedUri);
      onImageChange(uploadedUri);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div
        className={`relative ${
          aspectRatio === 1 ? "w-32 h-32 rounded-full" : "w-full h-48 rounded-lg"
        } overflow-hidden cursor-pointer`}
        onClick={handleImageClick}
        onKeyDown={handleImageClick}
      >
        {image ? (
          <img src={getImageUrl(image)} alt={""} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-500">Click to upload</span>
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleUploadNewImage} className="hidden" />
      {image && (
        <Button onClick={handleImageDelete} variant="outline">
          Delete
        </Button>
      )}
    </div>
  );
};

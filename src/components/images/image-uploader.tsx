import { uploadFile } from "@/lib/upload-utils";

import { Dialog, DialogContent, DialogFooter, DialogTrigger } from "../ui/dialog";

import { useState } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
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

export function ImageUploader({ label, initialImage, aspectRatio, handle, onImageChange }: ImageUploaderProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [image, setImage] = useState(initialImage);

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

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogTrigger asChild>
          <div
            className={`relative ${aspectRatio === 1 ? "w-32 h-32 rounded-full" : "w-full h-48 rounded-lg"} overflow-hidden cursor-pointer`}
          >
            {image ? (
              <img src={getImageUrl(image)} alt={label} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500">Click to upload</span>
              </div>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="sm:max-w-xl">
          {image ? (
            <div className="space-y-4">
              <img src={getImageUrl(image)} alt={label} className="w-fit object-scale-down" />
              <div className="flex space-x-2">
                <label htmlFor={`${label.toLowerCase()}-input`} className="cursor-pointer">
                  <Input
                    id={`${label.toLowerCase()}-input`}
                    type="file"
                    accept="image/*"
                    onChange={handleUploadNewImage}
                    className="hidden"
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Input id={`${label.toLowerCase()}-input`} type="file" accept="image/*" onChange={handleUploadNewImage} />
            </div>
          )}
          <DialogFooter>
            {image && (
              <Button onClick={handleImageDelete} variant="outline">
                Delete
              </Button>
            )}
            <Button onClick={() => setIsModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

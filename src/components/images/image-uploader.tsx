"use client";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { UploadIcon, XIcon } from "lucide-react";
import Cropper from "react-easy-crop";

import { useRef, useState } from "react";
import { Button } from "../ui/button";

export const getIpfsImageUrl = (uri: string | undefined): string => {
  if (!uri) return "";
  if (uri.startsWith("ipfs://")) {
    return `https://fountain.4everland.link/ipfs/${uri.slice(7)}`;
  }
  if (uri.startsWith("lens://")) {
    return `https://storage-api.testnet.lens.dev/${uri.slice(7)}`;
  }
  return uri;
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.src = url;
  });

async function getCroppedImg(
  imageSrc: string,
  pixelCrop: { x: number; y: number; width: number; height: number },
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("No 2d context");
  }

  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height,
  );

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) throw new Error("Canvas is empty");
      resolve(blob);
    }, "image/jpeg");
  });
}

interface ImageCropperUploaderProps {
  label: string;
  initialImage: string;
  aspectRatio: number;
  onImageChange: (newImage: File | null) => void;
}

export const ImageCropperUploader = ({ label, initialImage, aspectRatio, onImageChange }: ImageCropperUploaderProps) => {
  const [image, setImage] = useState(initialImage);
  const [localImage, setLocalImage] = useState<string | null>(null);
  const [showCropModal, setShowCropModal] = useState(false);
  const [tempImageUrl, setTempImageUrl] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<{
    x: number;
    y: number;
    width: number;
    height: number;
  } | null>(null);
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
      setTempImageUrl(localUrl);
      setShowCropModal(true);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const onCropComplete = (_croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropConfirm = async () => {
    if (!tempImageUrl || !croppedAreaPixels) return;

    try {
      const croppedImageBlob = await getCroppedImg(tempImageUrl, croppedAreaPixels);
      const croppedImageFile = new File([croppedImageBlob], "cropped-image.jpg", { type: "image/jpeg" });
      const croppedImageUrl = URL.createObjectURL(croppedImageBlob);

      setLocalImage(croppedImageUrl);
      onImageChange(croppedImageFile);
      setShowCropModal(false);
      setTempImageUrl(null);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
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
      <Dialog open={showCropModal} onOpenChange={(open) => !open && setShowCropModal(false)}>
        <DialogContent className="max-w-[800px] h-[600px] p-0">
          <div className="relative h-[450px] w-full rounded-t-md overflow-hidden">
            {tempImageUrl && (
              <Cropper
                image={tempImageUrl}
                crop={crop}
                zoom={zoom}
                aspect={aspectRatio}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                cropShape={aspectRatio === 1 ? "round" : "rect"}
                showGrid={false}
                onCropComplete={onCropComplete}
              />
            )}
          </div>
          <div className="px-8">
            <div className="flex items-center gap-4">
              <span className="text-sm text-muted-foreground">Zoom</span>
              <Slider
                value={[zoom]}
                onValueChange={([value]) => setZoom(value ?? 1)}
                min={1}
                max={5}
                step={0.05}
                className="w-96"
              />
            </div>
          </div>
          <div className="flex justify-between gap-2 p-4 border-t">
            <Button variant={"outline"} onClick={() => setShowCropModal(false)}>
              Cancel
            </Button>
            <Button variant={"default"} onClick={handleCropConfirm}>
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </span>
  );
};

interface ImageUploaderProps {
  label: string;
  initialImage: string;
  onImageChange: (newImage: File | null) => void;
  className?: string;
}

export const ImageUploader = ({ label, initialImage, onImageChange, className }: ImageUploaderProps) => {
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
        className={`relative w-full h-44 rounded-lg overflow-hidden cursor-pointer ring-2 ring-background ${className}`}
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
            <div className="placeholder-background" />
          </div>
        )}
      </div>
      <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileSelection} className="hidden" />
    </span>
  );
};

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useEffect, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";

interface ImageCropperProps {
  initialImage: string | File;
  onCroppedImage: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
  width?: number;
  height?: number;
}
export function ImageCropper({ initialImage, onCroppedImage, onCancel, aspectRatio }: ImageCropperProps) {
  const [image, setImage] = useState<string | File>(initialImage);
  const [scale, setScale] = useState(1);
  const editorRef = useRef<AvatarEditor>(null);
  const [cropperDimensions, setCropperDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      let width = img.width;
      let height = img.height;

      if (aspectRatio) {
        if (width / height > aspectRatio) {
          height = width / aspectRatio;
        } else {
          width = height * aspectRatio;
        }
      }

      // Limit the maximum size to prevent performance issues
      const maxSize = 800;
      if (width > maxSize || height > maxSize) {
        const ratio = maxSize / Math.max(width, height);
        width *= ratio;
        height *= ratio;
      }

      setCropperDimensions({ width, height });
    };
    img.src = image instanceof File ? URL.createObjectURL(image) : image as string;

    return () => {
      if (image instanceof File) {
        URL.revokeObjectURL(img.src);
      }
    };
  }, [image, aspectRatio]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      if (file) {
        setImage(file);
      }
    }
  };
  const handleScaleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const scale = Number.parseFloat(e.target.value);
    setScale(scale);
  };
  const handleSave = useCallback(() => {
    if (editorRef.current) {
      const canvas = editorRef.current.getImageScaledToCanvas();
      const croppedImage = canvas.toDataURL();
      onCroppedImage(croppedImage);
    }
  }, [onCroppedImage]);

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="image-upload">Upload Image</Label>
        <Input id="image-upload" type="file" onChange={handleFileChange} accept="image/*" />
      </div>
      {image && cropperDimensions.width > 0 && cropperDimensions.height > 0 && (
        <>
          <AvatarEditor
            ref={editorRef}
            image={image}
            width={cropperDimensions.width}
            height={cropperDimensions.height}
            border={50}
            scale={scale}
          />
          <div>
            <Label htmlFor="scale">Zoom</Label>
            <Input id="scale" type="range" onChange={handleScaleChange} min={1} max={2} step={0.01} defaultValue={1} />
          </div>
          <Button onClick={handleSave}>Save</Button>

          <Button onClick={onCancel}>Cancel</Button>
        </>
      )}
    </div>
  );
}

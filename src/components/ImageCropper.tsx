import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCallback, useRef, useState } from "react";
import AvatarEditor from "react-avatar-editor";

interface ImageCropperProps {
  initialImage: string | File;
  onCroppedImage: (croppedImage: string) => void;
  onCancel: () => void;
  aspectRatio?: number;
  width?: number;
  height?: number;
}

export function ImageCropper({ initialImage, onCroppedImage, onCancel }: ImageCropperProps) {
  const [image, setImage] = useState<string | File>(initialImage);
  const [scale, setScale] = useState(1);
  const editorRef = useRef<AvatarEditor>(null);

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
      {image && (
        <>
          <AvatarEditor ref={editorRef} image={image} width={250} height={250} border={50} scale={scale} />
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

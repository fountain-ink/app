import { uploadFile } from '@/lib/upload-utils';
import { useState } from 'react';
import { ImageCropper } from '../ImageCropper';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';

const getImageUrl = (uri: string | undefined): string => {
  if (!uri) return '';
  return uri.startsWith('ipfs://') ? `https://fountain.4everland.link/ipfs/${uri.slice(7)}` : uri;
};

interface ImageUploaderProps {
  label: string;
  initialImage: string;
  aspectRatio: number;
  handle: string;
  onImageChange: (newImage: string) => void;
}


export function ImageUploader({ label, initialImage, aspectRatio, handle, onImageChange }: ImageUploaderProps) {
  const [image, setImage] = useState(initialImage);
  const [tempImage, setTempImage] = useState<string | null>(null);
  const [isCropping, setIsCropping] = useState(false);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setTempImage(e.target.result as string);
          setIsCropping(true);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropSave = async (croppedImage: string) => {
    setIsCropping(false);
    if (handle) {
      const formData = new FormData();
      formData.append('file', dataURItoBlob(croppedImage));
      formData.append('handle', handle);

      const uploadedUri = await uploadFile(formData);
      setImage(uploadedUri);
      onImageChange(uploadedUri);
    }
  };

  const handleCropCancel = () => {
    setIsCropping(false);
    setTempImage(null);
  };

  const handleImageDelete = () => {
    setImage('');
    onImageChange('');
  };

  const dataURItoBlob = (dataURI: string) => {
    const parts = dataURI.split(',');
    const byteString = parts[1] ? atob(parts[1]) : '';
    const mimeString = parts[0]?.split(':')[1]?.split(';')[0] || 'application/octet-stream';
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], { type: mimeString });
  };

  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {isCropping ? (
        <ImageCropper
          initialImage={tempImage || ''}
          onCroppedImage={handleCropSave}
          onCancel={handleCropCancel}
          aspectRatio={aspectRatio}
        />
      ) : image ? (
        <div className={`relative ${aspectRatio === 1 ? 'w-32 h-32 rounded-full' : 'w-full h-48 rounded-lg'} overflow-hidden`}>
          <img src={getImageUrl(image)} alt={label} className="w-full h-full object-cover" />
        </div>
      ) : null}
      <div className="flex space-x-2">
        <Input id={`${label.toLowerCase()}-input`} type="file" accept="image/*" onChange={handleImageChange} />
        <Button onClick={handleImageDelete} variant="outline">
          Delete
        </Button>
      </div>
    </div>
  );
}

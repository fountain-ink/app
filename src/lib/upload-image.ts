"use client";

import { createImageUpload } from "@/components/editor/plugins/image-upload";
import { getIpfsImageUrl } from "@/components/images/image-uploader";
import { toast } from "sonner";
import { uploadFileFormData } from "./upload-utils";

export const uploadFile = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('handle', 'global');
  console.log(`Uploading file: ${file.name}`);
  const result = await uploadFileFormData(formData)
  console.log(`Uploaded file: ${file.name} to ${result}`);
  return getIpfsImageUrl( result);
}

export const uploadFn = createImageUpload({
  onUpload: async (file) => {
    const link = await uploadFile(file);
    return link
  },
  validateFn: (file) => {
    if (!file.type.includes("image/")) {
      console.error("File type not supported.");
      toast.error("File type not supported.");
      return false;
    }
    if (file.size / 1024 / 1024 > 20) {
      console.error("File size too big (max 20MB).");
      toast.error("File size too big (max 20MB).");
      return false;
    }
    return true;
  },
});

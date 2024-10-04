"use client";

import { toast } from "sonner";
import { uploadFileFormData } from "./upload-utils";
import { getIpfsImageUrl } from "@/components/images/image-uploader";
import { createImageUpload } from "@/components/editor/plugins/image-upload";

export const uploadFn = createImageUpload({
  onUpload: async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('handle', 'global'); 
    const result = await uploadFileFormData(formData)
    return getIpfsImageUrl( result);
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

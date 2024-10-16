"use client";

import { createImageUpload } from "@/components/editor/plugins/image-upload";
import { getIpfsImageUrl } from "@/components/images/image-uploader";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { uploadFileFormData } from "./upload-utils";

export const uploadFile = async (file: File) => {
  try {
    const compressedFile = await imageCompression(file, {
      maxSizeMB: 4.5,
      useWebWorker: true,
    });

    console.log(`compressedFile size ${compressedFile.size / 1024 / 1024} MB`); 

    const formData = new FormData();
    formData.append("file", compressedFile);
    formData.append("handle", "global");
    console.log(`Uploading file: ${file.name}`);
    const result = await uploadFileFormData(formData);
    console.log(`Uploaded file: ${file.name} to ${result}`);
    return getIpfsImageUrl(result);
  } catch (error) {
    console.error(error);
  }
};

export const uploadFn = createImageUpload({
  onUpload: async (file) => {
    return await uploadFile(file);
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

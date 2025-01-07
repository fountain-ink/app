"use client";

import { getIpfsImageUrl } from "@/components/images/image-uploader";
import imageCompression from "browser-image-compression";
import { toast } from "sonner";

export const uploadFile = async (input: File | ArrayBuffer | string) => {
  try {
    let fileToUpload: File;

    if (input instanceof File) {
      fileToUpload = await imageCompression(input, {
        maxSizeMB: 4.5,
        useWebWorker: true,
      });
    } else if (input instanceof ArrayBuffer) {
      const blob = new Blob([input]);
      fileToUpload = new File([blob], "file.dat");
    } else if (typeof input === "string") {
      const response = await fetch(input);
      const blob = await response.blob();
      fileToUpload = new File([blob], "file.dat");
    } else {
      throw new Error("Invalid input type");
    }

    if (fileToUpload.type.startsWith("image/")) {
      fileToUpload = await imageCompression(fileToUpload, {
        maxSizeMB: 4.5,
        useWebWorker: true,
      });
      console.log(`Compressed file size: ${fileToUpload.size / 1024 / 1024} MB`);
    }

    const formData = new FormData();
    formData.append("file", fileToUpload);

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Upload failed");
    }

    const { url } = await response.json();
    console.log(`Uploaded file to ${url}`);
    return getIpfsImageUrl(url);
  } catch (error) {
    console.error(error);
    toast.error("Failed to upload file");
    throw error;
  }
};

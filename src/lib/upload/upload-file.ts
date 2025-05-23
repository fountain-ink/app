"use client";

import imageCompression from "browser-image-compression";
import { toast } from "sonner";
import { storageClient } from "../lens/storage-client";
import { resolveUrl } from "../utils/resolve-url";

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

    const { uri } = await storageClient.uploadFile(fileToUpload);
    console.log(`Uploading file to ${uri}`);

    return resolveUrl(uri);
  } catch (error) {
    console.error(error);
    toast.error("Failed to upload file");
    throw error;
  }
};

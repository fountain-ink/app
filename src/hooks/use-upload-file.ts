"use client";

import { useState } from "react";
import { uploadFile } from "@/lib/upload/upload-file";

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
  headers?: Record<string, string>;
  onUploadBegin?: (fileName: string) => void;
  onUploadProgress?: (progress: { progress: number }) => void;
  skipPolling?: boolean;
}

interface UploadedFile {
  key: string; // Unique identifier
  url: string; // Public URL of the uploaded file
  name: string; // Original filename
  size: number; // File size in bytes
  type: string; // MIME type
}

export function useUploadFile({
  onUploadComplete,
  onUploadError,
  onUploadBegin,
  onUploadProgress,
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = useState<File>();
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFileWrapper(file: File) {
    setIsUploading(true);
    setUploadingFile(file);
    onUploadBegin?.(file.name);

    try {
      // console.log("uploading file", file);
      const url = await uploadFile(file);
      // console.log("uploaded file", url);

      const uploadedFile = {
        key: url.split("/").pop() || "",
        url,
        name: file.name,
        size: file.size,
        type: file.type,
      };
      console.log("uploaded file", uploadedFile);

      setUploadedFile(uploadedFile);
      onUploadComplete?.(uploadedFile);

      return uploadedFile;
    } catch (error) {
      onUploadError?.(error);
      throw error;
    } finally {
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    uploadFile: uploadFileWrapper,
    uploadedFile,
    uploadingFile,
  };
}

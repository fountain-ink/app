'use client';

import { useState } from 'react';
import { uploadFile } from '@/lib/upload/upload-file';

interface UseUploadFileProps {
  onUploadComplete?: (file: UploadedFile) => void;
  onUploadError?: (error: unknown) => void;
  headers?: Record<string, string>;
  onUploadBegin?: (fileName: string) => void;
  onUploadProgress?: (progress: { progress: number }) => void;
  skipPolling?: boolean;
}

interface UploadedFile {
  key: string;    // Unique identifier
  url: string;    // Public URL of the uploaded file
  name: string;   // Original filename
  size: number;   // File size in bytes
  type: string;   // MIME type
}

export function useUploadFile({ 
  onUploadComplete, 
  onUploadError,
  onUploadBegin,
  onUploadProgress 
}: UseUploadFileProps = {}) {
  const [uploadedFile, setUploadedFile] = useState<UploadedFile>();
  const [uploadingFile, setUploadingFile] = useState<File>();
  const [progress, setProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  async function uploadFileWrapper(file: File) {
    setIsUploading(true);
    setUploadingFile(file);
    onUploadBegin?.(file.name);
    setProgress(0);

    try {
      // Simulate progress since IPFS upload doesn't provide progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          const newProgress = Math.min(prev + 10, 90);
          onUploadProgress?.({ progress: newProgress });
          return newProgress;
        });
      }, 100);

      console.log('uploading file', file);
      const url = await uploadFile(file);
      console.log('uploaded file', url);

      clearInterval(progressInterval);
      setProgress(100);
      onUploadProgress?.({ progress: 100 });

      const uploadedFile = {
        key: url.split('/').pop() || '', // Use the IPFS hash as the key
        url,
        name: file.name,
        size: file.size,
        type: file.type,
      };
      console.log('uploaded file', uploadedFile);

      setUploadedFile(uploadedFile);
      onUploadComplete?.(uploadedFile);
      
      return uploadedFile;
    } catch (error) {
      onUploadError?.(error);
      throw error;
    } finally {
      setProgress(0);
      setIsUploading(false);
      setUploadingFile(undefined);
    }
  }

  return {
    isUploading,
    progress,
    uploadFile: uploadFileWrapper,
    uploadedFile,
    uploadingFile,
  };
} 
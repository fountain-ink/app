"use client";

export async function uploadFileFormData(formData: FormData) {
  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || "Failed to upload file");
  }

  const { url } = await response.json();
  return url;
} 
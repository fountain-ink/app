"use client";

export async function uploadMetadata(data: any) {
  try {
    const formData = new FormData();
    formData.append("file", new Blob([JSON.stringify(data)], { type: "application/json" }));

    const response = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to upload metadata");
    }

    const { url } = await response.json();
    return url;
  } catch (error) {
    console.error("Metadata upload error:", error);
    throw error;
  }
} 
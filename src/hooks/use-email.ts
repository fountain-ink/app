"use client";

import { useState } from "react";

export function useEmail(initialEmail?: string | null) {
  const [email, setEmail] = useState<string | null>(initialEmail ?? null);
  const [isLoading, setIsLoading] = useState(initialEmail === undefined);

  const saveEmail = async (newEmail: string | null) => {
    try {
      const response = await fetch("/api/email", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: newEmail }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save email");
      }

      setEmail(newEmail);
      return true;
    } catch (error) {
      console.error("Error saving email:", error);
      return false;
    }
  };

  const fetchEmail = async () => {
    try {
      setIsLoading(true);
      const response = await fetch("/api/email");
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch email");
      }

      setEmail(data.email);
      return data.email;
    } catch (error) {
      console.error("Error fetching email:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    email,
    saveEmail,
    fetchEmail,
    isLoading,
  };
} 
import { settingsEvents } from "@/lib/settings/events";
import { useState } from "react";
import { Database } from "@/lib/supabase/database";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface BlogMetadata {
  showAuthor?: boolean;
  showTags?: boolean;
  showTitle?: boolean;
}

export type BlogSettings = Omit<Database["public"]["Tables"]["blogs"]["Row"], "metadata"> & {
  metadata?: BlogMetadata | null;
};

export function useBlogSettings(blogAddress: string, initialSettings: BlogSettings) {
  const [settings, setSettings] = useState<BlogSettings>( initialSettings );
  const [isLoading, setIsLoading] = useState(!initialSettings);

  const saveSettings = async (newSettings: Partial<BlogSettings>) => {
    try {
      const response = await fetch(`/api/blogs/${blogAddress}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          settings: newSettings,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to save settings");
      }

      setSettings(current => ({ ...current, ...newSettings }));
      settingsEvents.emit("saved");
      return true;
    } catch (error) {
      console.error("Error saving blog settings:", error);
      const errorMessage = error instanceof Error ? error.message : "Failed to save settings";
      settingsEvents.emit("error", errorMessage);
      return false;
    }
  };

  return {
    settings,
    saveSettings,
    isLoading,
  };
}

interface BlogState {
  blogs: BlogSettings[];
  lastSynced: number;
}

interface BlogStorage {
  blogState: BlogState;
  setBlogs: (blogs: BlogSettings[]) => void;
  getBlogs: () => BlogSettings[];
  updateLastSynced: () => void;
  needsSync: () => boolean;
}

export const useBlogStorage = create<BlogStorage>()(
  persist(
    (set, get) => ({
      blogState: {
        blogs: [],
        lastSynced: 0,
      },
      setBlogs: (blogs: BlogSettings[]) =>
        set((state) => ({
          blogState: { ...state.blogState, blogs },
        })),
      getBlogs: () => get().blogState.blogs,
      updateLastSynced: () =>
        set((state) => ({
          blogState: { ...state.blogState, lastSynced: Date.now() },
        })),
      needsSync: () => {
        const { lastSynced } = get().blogState;
        return !lastSynced || Date.now() - lastSynced > 5 * 60 * 1000;
      },
    }),
    {
      name: "blog-storage",
    }
  )
); 
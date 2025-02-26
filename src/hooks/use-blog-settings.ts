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
  isFetching: boolean;
}

interface BlogStorage {
  blogState: BlogState;
  setBlogs: (blogs: BlogSettings[]) => void;
  getBlogs: () => BlogSettings[];
  updateLastSynced: () => void;
  needsSync: () => boolean;
  getLastSynced: () => number;
  resetState: () => void;
  fetchBlogsIfNeeded: () => Promise<BlogSettings[]>;
  isFetching: () => boolean;
}

// Create a zustand store with persist middleware
export const useBlogStorage = create<BlogStorage>()(
  persist(
    (set, get) => ({
      blogState: {
        blogs: [],
        lastSynced: 0,
        isFetching: false
      },
      setBlogs: (blogs: BlogSettings[]) =>
        set((state) => {
          console.log('Setting blogs:', blogs);
          return {
            blogState: { ...state.blogState, blogs },
          };
        }),
      getBlogs: () => {
        const state = get();
        console.log('Full state in getBlogs:', state);
        return state.blogState.blogs;
      },
      updateLastSynced: () => {
        const timestamp = Date.now();
        console.log('Updating lastSynced timestamp', timestamp);
        set((state) => {
          const newState = {
            blogState: { ...state.blogState, lastSynced: timestamp },
          };
          console.log('New state after update:', newState);
          return newState;
        });
      },
      getLastSynced: () => {
        const state = get();
        console.log('Full state in getLastSynced:', state);
        return state.blogState.lastSynced;
      },
      needsSync: () => {
        const state = get();
        const lastSynced = state.blogState.lastSynced;
        console.log('Full state in needsSync:', state);
        console.log('Last synced timestamp:', lastSynced);
        console.log('Current time:', Date.now());
        console.log('Difference (minutes):', (Date.now() - lastSynced) / (60 * 1000));
        return !lastSynced || Date.now() - lastSynced > 5 * 60 * 1000;
      },
      resetState: () => {
        console.log('Resetting blog storage state');
        set({
          blogState: {
            blogs: [],
            lastSynced: Date.now(),
            isFetching: false
          }
        });
      },
      isFetching: () => {
        return get().blogState.isFetching;
      },
      fetchBlogsIfNeeded: async () => {
        const state = get();
        
        // Return cached blogs if they exist and don't need to be synced
        if (state.blogState.blogs.length > 0 && !get().needsSync() && !state.blogState.isFetching) {
          console.log('Using cached blogs, no fetch needed');
          return state.blogState.blogs;
        }
        
        // Don't fetch if already fetching
        if (state.blogState.isFetching) {
          console.log('Already fetching blogs, waiting...');
          // Wait for existing fetch to complete
          return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              if (!get().isFetching()) {
                clearInterval(checkInterval);
                resolve(get().blogState.blogs);
              }
            }, 100);
          });
        }
        
        // Set fetching state to true
        set(state => ({ 
          blogState: { ...state.blogState, isFetching: true } 
        }));
        
        console.log('Fetching fresh blogs');
        try {
          const response = await fetch('/api/blogs');
          if (!response.ok) throw new Error('Failed to fetch blogs');
          
          const data = await response.json();
          
          // Update blogs in storage
          set(state => ({ 
            blogState: { 
              ...state.blogState, 
              blogs: data.blogs, 
              lastSynced: Date.now(),
              isFetching: false
            } 
          }));
          
          console.log('Blogs fetched and cached:', data.blogs);
          return data.blogs;
        } catch (error) {
          console.error('Error fetching blogs:', error);
          // Reset fetching state
          set(state => ({ 
            blogState: { ...state.blogState, isFetching: false } 
          }));
          return get().blogState.blogs; // Return existing blogs on error
        }
      }
    }),
    {
      name: "blog-storage",
      version: 2,
      migrate: (persistedState: any, version) => {
        console.log('Migrating storage', persistedState, version);
        
        if (!persistedState.blogState || 
            typeof persistedState.blogState.lastSynced !== 'number') {
          console.log('Invalid state structure detected, resetting');
          return {
            blogState: {
              blogs: [],
              lastSynced: Date.now(),
              isFetching: false
            }
          };
        }
        
        // Add isFetching field if it doesn't exist
        if (persistedState.blogState && persistedState.blogState.isFetching === undefined) {
          persistedState.blogState.isFetching = false;
        }
        
        return persistedState as BlogStorage;
      },
    }
  )
); 
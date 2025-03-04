import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BlogData } from "@/lib/settings/get-blog-metadata";

interface BlogState {
  blogs: BlogData[];
  lastSynced: number;
  isFetching: boolean;
}

interface BlogStorage {
  blogState: BlogState;
  setBlogs: (blogs: BlogData[]) => void;
  getBlogs: () => BlogData[];
  updateLastSynced: () => void;
  needsSync: () => boolean;
  getLastSynced: () => number;
  resetState: () => void;
  fetchBlogsIfNeeded: () => Promise<BlogData[]>;
  isFetching: () => boolean;
}

export const useBlogStorage = create<BlogStorage>()(
  persist(
    (set, get) => ({
      blogState: {
        blogs: [],
        lastSynced: 0,
        isFetching: false
      },
      setBlogs: (blogs: BlogData[]) =>
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
        set((state) => {
          const newState = {
            blogState: { ...state.blogState, lastSynced: timestamp },
          };
          return newState;
        });
      },
      getLastSynced: () => {
        const state = get();
        return state.blogState.lastSynced;
      },
      needsSync: () => {
        const state = get();
        const lastSynced = state.blogState.lastSynced;
        return !lastSynced || Date.now() - lastSynced > 5 * 60 * 1000;
      },
      resetState: () => {
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
        
        if (state.blogState.blogs.length > 0 && !get().needsSync() && !state.blogState.isFetching) {
          console.log('Using cached blogs, no fetch needed');
          return state.blogState.blogs;
        }
        
        if (state.blogState.isFetching) {
          console.log('Already fetching blogs, waiting...');
          return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
              if (!get().isFetching()) {
                clearInterval(checkInterval);
                resolve(get().blogState.blogs);
              }
            }, 100);
          });
        }
        
        set(state => ({ 
          blogState: { ...state.blogState, isFetching: true } 
        }));
        
        console.log('Fetching fresh blogs');
        try {
          const response = await fetch('/api/blogs');
          if (!response.ok) throw new Error('Failed to fetch blogs');
          
          const data = await response.json();
          
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
          set(state => ({ 
            blogState: { ...state.blogState, isFetching: false } 
          }));
          return get().blogState.blogs;
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
        
        if (persistedState.blogState && persistedState.blogState.isFetching === undefined) {
          persistedState.blogState.isFetching = false;
        }
        
        return persistedState as BlogStorage;
      },
    }
  )
); 
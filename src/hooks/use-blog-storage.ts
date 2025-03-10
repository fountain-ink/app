import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BlogData } from "@/lib/settings/get-blog-data";

interface BlogState {
  blogs: BlogData[];
  lastSynced: number;
  isFetching: boolean;
}

interface BlogStorage {
  blogState: BlogState;
  setBlogs: (blogs: BlogData[]) => void;
  getBlogs: () => Promise<BlogData[]>;
  resetState: () => void;
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
            blogState: { 
              ...state.blogState, 
              blogs,
              lastSynced: Date.now() 
            },
          };
        }),
      getBlogs: async () => {
        const state = get();
        const { blogs, lastSynced, isFetching } = state.blogState;
        
        // If we have blogs and they're fresh (synced within the last 5 minutes), return them
        const isFresh = lastSynced && (Date.now() - lastSynced < 5 * 60 * 1000);
        if (blogs.length > 0 && isFresh && !isFetching) {
          console.log('Using cached blogs, no fetch needed');
          return blogs;
        }
        
        // If already fetching, wait for it to complete
        if (isFetching) {
          console.log('Already fetching blogs, waiting...');
          return new Promise((resolve) => {
            const maxWaitTime = 10000; // 10 seconds
            const startTime = Date.now();
            
            const checkInterval = setInterval(() => {
              const currentState = get().blogState;
              if (!currentState.isFetching) {
                clearInterval(checkInterval);
                resolve(currentState.blogs);
              } else if (Date.now() - startTime > maxWaitTime) {
                console.warn('Blog fetch timeout exceeded, resetting fetch state');
                clearInterval(checkInterval);
                set(state => ({ 
                  blogState: { ...state.blogState, isFetching: false } 
                }));
                resolve(get().blogState.blogs);
              }
            }, 100);
          });
        }
        
        // Start fetching
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
      },
      resetState: () => {
        set({
          blogState: {
            blogs: [],
            lastSynced: 0,
            isFetching: false
          }
        });
      }
    }),
    {
      name: "blog-storage",
      version: 3, // Increment version due to interface changes
      migrate: (persistedState: any, version) => {
        console.log('Migrating storage', persistedState, version);
        
        if (!persistedState.blogState || 
            typeof persistedState.blogState.lastSynced !== 'number') {
          console.log('Invalid state structure detected, resetting');
          return {
            blogState: {
              blogs: [],
              lastSynced: 0,
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
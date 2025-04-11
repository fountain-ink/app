"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type PostStoreEntry = {
  // Stats
  likes: number;
  collects: number;
  tips: number;
  comments: number;
  reposts: number;
  bookmarks: number;
  quotes: number;

  // Operations
  hasLiked: boolean;
  hasBookmarked: boolean;
  hasReposted: boolean;
  hasQuoted: boolean;

  // Sheet states
  isCommentSheetOpen: boolean;
  isCollectSheetOpen: boolean;
};

// Define the type for our post actions context
export type PostActionsContextType = {
  actionState: {
    [postId: string]: PostStoreEntry;
  };
  updatePostAction: (
    postId: string,
    updates: Partial<PostStoreEntry>
  ) => void;
};

// Create the context with a default value
export const PostActionsContext = createContext<PostActionsContextType | undefined>(undefined);

// Custom hook to use the context
export const usePostActionsContext = () => {
  const context = useContext(PostActionsContext);
  if (!context) {
    throw new Error("usePostActionsContext must be used within a PostActionsProvider");
  }
  return context;
};

type PostActionsProviderProps = {
  children: ReactNode;
};

export const PostActionsProvider = ({ children }: PostActionsProviderProps) => {
  // Add state for post actions
  const [actionState, setActionState] = useState<{
    [postId: string]: PostStoreEntry;
  }>({});

  // Function to update a post's action state
  const updatePostAction = (postId: string, updates: Partial<PostStoreEntry>) => {
    setActionState(prevState => {
      // Create a new state object
      const newState = { ...prevState };

      // If this post doesn't exist in state yet, create an empty entry
      if (!newState[postId]) {
        newState[postId] = {
          likes: 0,
          collects: 0,
          tips: 0,
          comments: 0,
          reposts: 0,
          bookmarks: 0,
          quotes: 0,
          hasLiked: false,
          hasBookmarked: false,
          hasReposted: false,
          hasQuoted: false,
          isCommentSheetOpen: false,
          isCollectSheetOpen: false
        };
      }

      // Apply the updates
      newState[postId] = {
        ...newState[postId],
        ...updates
      };

      return newState;
    });
  };

  // Create the context value
  const contextValue: PostActionsContextType = {
    actionState,
    updatePostAction,
  };

  return (
    <PostActionsContext.Provider value={contextValue}>
      {children}
    </PostActionsContext.Provider>
  );
}; 
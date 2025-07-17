"use client";

import React, { createContext, useContext } from "react";
import { BlogData } from "@/lib/settings/get-blog-data";

interface BlogDataContextType {
  blogAddress: string | null;
  blogData: BlogData | null;
}

const BlogDataContext = createContext<BlogDataContextType | undefined>(undefined);

export const BlogDataProvider: React.FC<{
  children: React.ReactNode;
  blogAddress: string | null;
  blogData: BlogData | null;
}> = ({ children, blogAddress, blogData }) => {
  return <BlogDataContext.Provider value={{ blogAddress, blogData }}>{children}</BlogDataContext.Provider>;
};

export const useBlogData = (): BlogDataContextType => {
  const context = useContext(BlogDataContext);
  if (!context) {
    throw new Error("useBlogData must be used within a BlogDataProvider");
  }
  return context;
};

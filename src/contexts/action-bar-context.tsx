"use client";

import React, { createContext, useContext, useRef } from "react";

interface ActionBarContextType {
  actionBarRef: React.RefObject<HTMLDivElement>;
}

const ActionBarContext = createContext<ActionBarContextType | undefined>(undefined);

export const ActionBarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const actionBarRef = useRef<HTMLDivElement>(null);

  return <ActionBarContext.Provider value={{ actionBarRef }}>{children}</ActionBarContext.Provider>;
};

export const useActionBar = (): ActionBarContextType => {
  const context = useContext(ActionBarContext);
  if (!context) {
    throw new Error("useActionBar must be used within an ActionBarProvider");
  }
  return context;
};

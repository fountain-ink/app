"use client";

import { type ThemeType, globalThemes } from "@/styles/themes";
import type React from "react";
import { type PropsWithChildren, type ReactNode, createContext, useContext, useEffect, useState } from "react";

import { useStorage } from "@/hooks/use-storage";

import { defaultTheme, isValidTheme } from "@/styles/themes";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const { theme: storedTheme, setTheme: setStoredTheme } = useStorage();
  const [theme, setTheme] = useState<ThemeType>(() => (isValidTheme(storedTheme) ? storedTheme : defaultTheme));
  
  useEffect(() => {
    const root = document.documentElement;
    for (const [property, value] of Object.entries(globalThemes[theme])) {
      if (typeof value === "string") {
        root.style.setProperty(property, value);
      }
    }
  }, [theme]);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

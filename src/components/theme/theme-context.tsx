"use client";

import { type ThemeType, globalThemes } from "@/styles/themes";
import { type PropsWithChildren, createContext, useContext, useEffect, useState } from "react";

import { useStorage } from "@/hooks/use-storage";

import { defaultTheme, isValidTheme } from "@/styles/themes";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const { theme: storedTheme, setTheme: setStoredTheme } = useStorage();
  console.log("Stored theme:", storedTheme);

  const [theme, setTheme] = useState<ThemeType>(() => {
    const initialTheme = isValidTheme(storedTheme) ? storedTheme : defaultTheme;
    console.log("Initial theme:", initialTheme);
    return initialTheme;
  });

  useEffect(() => {
    console.log("Theme changed to:", theme);
    const root = document.documentElement;
    if (!root) {
      console.error("Document root element not found");
      return;
    }

    const themeStyles = globalThemes[theme];
    if (!themeStyles) {
      console.error("Theme styles not found for theme:", theme);
      return;
    }

    for (const [property, value] of Object.entries(themeStyles)) {
      if (typeof value === "string") {
        root.style.setProperty(property, value);
      } else {
        console.warn(`Invalid value for property ${property}:`, value);
      }
    }
  }, [theme]);

  const contextValue = { theme, setTheme };
  console.log("Providing theme context:", contextValue);

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    console.error("useTheme was called outside of ThemeProvider");
    return {
      theme: defaultTheme,
      setTheme: () => {
        console.warn("setTheme called outside of ThemeProvider, no effect");
      },
    };
  }
  return context;
};

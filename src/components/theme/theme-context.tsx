"use client";

import setGlobalColorTheme, { type ThemeType, defaultThemeName } from "@/styles/themes";
import { useTheme as useNextTheme } from "next-themes";
import { type PropsWithChildren, createContext, useContext, useEffect, useState } from "react";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const { theme: nextTheme } = useNextTheme();
  const [isMounted, setIsMounted] = useState(false);

  const [theme, setTheme] = useState<ThemeType>(() => {
    const initialTheme = defaultThemeName;
    return initialTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (!root) return;

    setGlobalColorTheme(nextTheme as "light" | "dark", theme);

    if (!isMounted) {
      setIsMounted(true);
    }
  }, [theme, nextTheme, isMounted]);

  if (!isMounted) {
    return null;
  }

  const contextValue = { theme, setTheme, isMounted };

  return <ThemeContext.Provider value={contextValue}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};

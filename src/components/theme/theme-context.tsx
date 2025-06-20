"use client";

import { useTheme as useNextTheme } from "next-themes";
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import setGlobalColorTheme, { defaultThemeName, type ThemeType } from "@/styles/themes";

interface ThemeContextType {
  theme: ThemeType;
  setTheme: (theme: ThemeType) => void;
  isMounted: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: PropsWithChildren) => {
  const { resolvedTheme: lightMode } = useNextTheme();
  const [isMounted, setIsMounted] = useState(false);

  const [theme, setTheme] = useState<ThemeType>(() => {
    const initialTheme = defaultThemeName;
    return initialTheme;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (!root || !lightMode) return;

    setGlobalColorTheme(lightMode as "light" | "dark", theme);

    if (!isMounted) {
      setIsMounted(true);
    }
  }, [theme, lightMode, isMounted]);

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

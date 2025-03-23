"use client";

import { defaultThemeName, isValidTheme, ThemeType } from "@/styles/themes";
import { useEffect } from "react";
import { useTheme } from "../theme/theme-context";

interface BlogThemeProps {
  children: React.ReactNode;
  initialTheme?: string;
}

export const BlogTheme = ({ children, initialTheme }: BlogThemeProps) => {
  const { setTheme } = useTheme();

  useEffect(() => {
    const themeName = initialTheme ?? defaultThemeName;
    if (isValidTheme(themeName)) {
      setTheme(themeName);
    }

    return () => {
      setTheme(defaultThemeName);
    };
  }, [initialTheme, setTheme]);

  return <>{children}</>;
};

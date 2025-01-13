"use client";

import { defaultThemeName, isValidTheme, ThemeType } from "@/styles/themes";
import { useEffect } from "react";
import { useTheme } from "../theme/theme-context";

interface UserThemeProps {
  children: React.ReactNode;
  initialTheme?: string;
}

export const UserTheme = ({ children, initialTheme }: UserThemeProps) => {
  const { setTheme } = useTheme();

  useEffect(() => {
    const themeName = initialTheme ?? defaultThemeName;
    if (isValidTheme(themeName)) {
      setTheme(themeName);
    }

    return () => {
      // Revert to the default theme when unmounting
      setTheme(defaultThemeName);
    };
  }, [initialTheme, setTheme]);

  return <>{children}</>;
};

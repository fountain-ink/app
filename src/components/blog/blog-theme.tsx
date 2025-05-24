"use client";

import { defaultThemeName, isValidTheme, ThemeType } from "@/styles/themes";
import { useEffect, useMemo } from "react";
import DOMPurify from "dompurify";
import { useTheme } from "../theme/theme-context";

interface BlogThemeProps {
  children: React.ReactNode;
  initialTheme?: string;
  customCss?: string | null;
}

export const BlogTheme = ({ children, initialTheme, customCss }: BlogThemeProps) => {
  const { setTheme } = useTheme();
  const sanitizedCustomCss = useMemo(() => {
    return customCss ? DOMPurify.sanitize(customCss) : "";
  }, [customCss]);

  useEffect(() => {
    const themeName = initialTheme ?? defaultThemeName;
    if (isValidTheme(themeName)) {
      setTheme(themeName);
    }

    return () => {
      setTheme(defaultThemeName);
    };
  }, [initialTheme, setTheme]);

  return (
    <>
      {/* biome-ignore lint/security/noDangerouslySetInnerHtml: custom CSS is user-provided */}
      {sanitizedCustomCss ? <style dangerouslySetInnerHTML={{ __html: sanitizedCustomCss }} /> : null}
      {children}
    </>
  );
};

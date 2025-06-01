"use client";

import { defaultThemeName, isValidTheme, ThemeType } from "@/styles/themes";
import { useEffect, useMemo } from "react";
import DOMPurify from "dompurify";
import { useTheme } from "../theme/theme-context";

const COLOR_PROPS = [
  "color",
  "background",
  "background-color",
  "border-color",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "outline-color",
];

function applyImportantToColors(css: string) {
  const propertyRegex = /(\s*)([^{}]+{[^}]*})/gms;
  return css.replace(propertyRegex, (block, leadingWhitespace, rule) => {
    return (
      leadingWhitespace +
      rule.replace(/([^;{}]+):\s*([^;!]+)(;?)/g, (match: any, prop: string, value: string, semicolon: any) => {
        const property = prop.trim();
        const lowerProp = property.toLowerCase();
        if (value.trim().endsWith("!important") || (!property.startsWith("--") && !COLOR_PROPS.includes(lowerProp))) {
          return match;
        }
        return `${property}: ${value.trim()} !important${semicolon}`;
      })
    );
  });
}

interface BlogThemeProps {
  children: React.ReactNode;
  initialTheme?: string;
  customCss?: string | null;
}

export const BlogTheme = ({ children, initialTheme, customCss }: BlogThemeProps) => {
  const { setTheme } = useTheme();
  const sanitizedCustomCss = useMemo(() => {
    console.log("applying custom css: ", customCss);
    const sanitized = customCss ? DOMPurify.sanitize(customCss) : "";
    return sanitized ? applyImportantToColors(sanitized) : "";
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

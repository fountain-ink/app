"use client";

import { globalThemes, themeNames, themeDescriptions } from "@/styles/themes";
import { useTheme as useNextTheme } from "next-themes";
import type { ThemeType } from "@/styles/themes";

interface ThemeButtonsProps {
  onChange?: (theme: ThemeType) => void;
  disabled?: boolean;
  currentTheme?: ThemeType;
}

export const ThemeButtons = ({ onChange, disabled, currentTheme }: ThemeButtonsProps) => {
  const { resolvedTheme } = useNextTheme();

  const handleThemeChange = (theme: ThemeType) => {
    // Only call onChange callback, don't set the theme directly
    onChange?.(theme);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {themeNames.map((themeName) => {
        const theme = globalThemes[themeName];
        const colors = theme[resolvedTheme === "dark" ? "dark" : "light"];
        const shared = theme.shared;
        const isSelected = currentTheme === themeName;

        // Styles for the theme name and description
        const titleStyle = {
          fontFamily: shared["--title-font"],
          fontWeight: shared["--title-weight"],
          fontStyle: shared["--title-style"],
          fontSize: "1.5rem",
          lineHeight: "1.2",
          letterSpacing: shared["--title-letter-spacing"],
          // color: `hsl(${colors["--foreground"]})`,
        };

        const textStyle = {
          fontFamily: shared["--paragraph-font"],
          fontWeight: shared["--paragraph-weight"],
          fontStyle: shared["--paragraph-style"],
          fontSize: "1rem",
          lineHeight: shared["--paragraph-line-height"],
          letterSpacing: shared["--paragraph-letter-spacing"],
          color: "hsl(var(--muted-foreground))",
          // color: `hsl(${colors["--foreground"]})`,
        };

        const cardStyle = {
          // backgroundColor: `hsl(${colors["--card"]})`,
          // borderColor: isSelected ? `hsl(${colors["--primary"]})` : `hsl(${colors["--border"]})`,
        };

        return (
          <div
            key={themeName}
            className={`border rounded-sm relative cursor-pointer overflow-hidden transition-all hover:border-primary ${
              isSelected ? "border-primary" : "border-border"
            }`}
            style={cardStyle}
            onClick={() => handleThemeChange(themeName)}
          >
            <div className="p-8 py-4">
              <h1 style={titleStyle} className="capitalize">
                {themeName}
              </h1>
              <p style={textStyle}>
                {themeDescriptions[themeName]}
              </p>
            </div>
            {isSelected && (
              <div className="absolute top-4 right-4 h-4 w-4 bg-primary text-primary-foreground rounded-full flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

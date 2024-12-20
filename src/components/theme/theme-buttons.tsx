"use client";

import { globalThemes, themeNames } from "@/styles/themes";
import { useTheme as useNextTheme } from "next-themes";
import { Button } from "../ui/button";
import { useTheme as useLocalTheme } from "./theme-context";

import type { ThemeType } from "@/styles/themes";

interface ThemeButtonsProps {
  onChange?: (theme: ThemeType) => void;
  disabled?: boolean;
  currentTheme?: ThemeType;
}

export const ThemeButtons = ({ onChange, disabled, currentTheme }: ThemeButtonsProps) => {
  const { resolvedTheme } = useNextTheme();
  const { setTheme } = useLocalTheme();

  const handleThemeChange = (theme: ThemeType) => {
    setTheme(theme);
    onChange?.(theme);
  };

  const themeButtons = themeNames.map((themeName) => {
    const theme = globalThemes[themeName];
    const colors = theme[resolvedTheme === "dark" ? "dark" : "light"];
    const shared = theme.shared;
    const placeholderText =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.";

    const buttonStyle = {
      backgroundColor: `hsl(${colors["--background"]})`,
      color: `hsl(${colors["--foreground"]})`,
      borderColor: `hsl(${colors["--border"]})`,
    };

    const titleStyle = {
      fontFamily: shared["--title-font"],
      fontWeight: shared["--title-weight"],
      fontStyle: shared["--title-style"],
      fontSize: "2.5rem", // Smaller than actual for preview
      lineHeight: "1.2",
      letterSpacing: shared["--title-letter-spacing"],
      marginBottom: "1rem",
      textAlign: shared["--title-align"] as "left" | "center" | "right",
    };

    const textStyle = {
      fontFamily: shared["--paragraph-font"],
      fontWeight: shared["--paragraph-weight"],
      fontStyle: shared["--paragraph-style"],
      fontSize: shared["--paragraph-size"],
      lineHeight: shared["--paragraph-line-height"],
      letterSpacing: shared["--paragraph-letter-spacing"],
      textAlign: shared["--paragraph-align"] as "left" | "center" | "right",
    };

    return (
      <Button
        variant="outline"
        className="flex flex-col items-start overflow-visible w-full h-fit p-8 hover:bg-transparent"
        style={buttonStyle}
        key={themeName}
        onClick={() => handleThemeChange(themeName)}
        disabled={disabled}
      >
        <h1 style={titleStyle}>
          {themeName} {currentTheme === themeName && "(Current)"}
        </h1>
        <p style={textStyle} className="break-words whitespace-normal">
          {placeholderText}
        </p>
      </Button>
    );
  });

  return <div className="flex flex-col gap-2">{themeButtons}</div>;
};

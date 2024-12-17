"use client";

import { themeNames } from "@/styles/themes";
import { Button } from "../ui/button";
import { useTheme } from "./theme-context";

import { ThemeType } from "@/styles/themes";

interface ThemeButtonsProps {
  onChange?: (theme: ThemeType) => void;
  disabled?: boolean;
}

export const ThemeButtons = ({ onChange, disabled }: ThemeButtonsProps) => {
  const { setTheme } = useTheme();

  const handleThemeChange = (theme: ThemeType) => {
    setTheme(theme);
    onChange?.(theme);
  };

  const themeButtons = themeNames.map((theme) => {
    const placeholderText =
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

    return (
      <Button
        variant="outline"
        className="flex flex-col items-start overflow-visible text-left gap-2 w-full h-fit p-8"
        style={{
          backgroundColor: "hsl(var(--background))",
          color: "hsl(var(--foreground))",
        }}
        key={theme}
        onClick={() => handleThemeChange(theme)}
        disabled={disabled}
      >
        <h1
          style={{
            fontFamily: "var(--title-font)",
            fontWeight: "var(--title-weight)",
            fontStyle: "var(--title-style)",
            fontSize: "var(--title-size)",
            lineHeight: "var(--title-line-height)",
            letterSpacing: "var(--title-letter-spacing)",
            color: "var(--title-color)",
          }}
        >
          {theme}
        </h1>
        <p className="text-md break-all whitespace-normal">{placeholderText}</p>
      </Button>
    );
  });

  return <div className="flex flex-col gap-2">{themeButtons}</div>;
};

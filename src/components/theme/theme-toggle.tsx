"use client";

import { MoonIcon, SunIcon } from "lucide-react";
import { useTheme } from "next-themes";
import { Button } from "../ui/button";

export const ThemeToggle = () => {
  const { resolvedTheme: theme, setTheme } = useTheme();

  return (
    <Button
      variant="ghost"
      className="flex items-center justify-center hover:bg-transparent shrink-0 w-10 h-10 p-0"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle Dark Mode"
    >
      {theme === "light" ? <MoonIcon className="w-6 h-6" /> : <SunIcon className="w-6 h-6" />}
    </Button>
  );
};

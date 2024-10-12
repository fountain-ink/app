"use client";

import { isValidTheme } from "@/styles/themes";
import type { ProfileFragment } from "@lens-protocol/client";
import { useEffect } from "react";
import { useTheme } from "../theme/theme-context";

import { useStorage } from "@/hooks/use-storage";

export const UserTheme = ({ children, profile }: { children: React.ReactNode; profile: ProfileFragment }) => {
  const userTheme = profile?.metadata?.attributes?.find((attr) => attr.key === "theme")?.value;
  const { theme: currentTheme, setTheme } = useTheme();
  const { theme: defaultTheme } = useStorage();

  useEffect(() => {
    if (userTheme && isValidTheme(userTheme)) {
      setTheme(userTheme);
    }

    return () => {
      // Revert to the default theme when unmounting
      setTheme(defaultTheme);
    };
  }, [userTheme, setTheme, defaultTheme]);

  return <>{children}</>;
};

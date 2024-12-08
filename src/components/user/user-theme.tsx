"use client";

import { defaultThemeName, isValidTheme } from "@/styles/themes";
import type { ProfileFragment } from "@lens-protocol/client";
import { useEffect } from "react";
import { useTheme } from "../theme/theme-context";

import { useStorage } from "@/hooks/use-storage";

export const UserTheme = ({
  children,
  profile,
}: { children: React.ReactNode; profile: ProfileFragment | undefined }) => {
  const userTheme = profile?.metadata?.attributes?.find((attr) => attr.key === "theme")?.value ?? defaultThemeName;
  const { setTheme } = useTheme();

  useEffect(() => {
    if (userTheme && isValidTheme(userTheme)) {
      setTheme(userTheme);
    }

    return () => {
      // Revert to the default theme when unmounting
      setTheme(defaultThemeName);
    };
  }, [userTheme, setTheme]);

  return <>{children}</>;
};

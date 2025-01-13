"use client";

import { defaultThemeName, isValidTheme } from "@/styles/themes";
import { Account } from "@lens-protocol/client";
import { useEffect } from "react";
import { useTheme } from "../theme/theme-context";

export const UserTheme = ({ children, account: profile }: { children: React.ReactNode; account?: Account }) => {
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

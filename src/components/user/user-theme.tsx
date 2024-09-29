"use client";

import { isValidTheme } from "@/styles/themes";
import type { ProfileFragment } from "@lens-protocol/client";
import { useEffect } from "react";
import { toast } from "sonner";
import { useTheme } from "../theme/theme-context";

export const UserTheme = ({ children, profile }: { children: React.ReactNode; profile: ProfileFragment }) => {
  const themeAttribute = profile?.metadata?.attributes?.find((attr) => attr.key === "theme")?.value;
  const { setTheme } = useTheme();

  useEffect(() => {
    if (!themeAttribute) return;

    if (!isValidTheme(themeAttribute)) {
      toast.error("Invalid theme");
      return;
    }

    setTheme(themeAttribute);
  }, [themeAttribute, setTheme]);

  return <>{children}</>;
};

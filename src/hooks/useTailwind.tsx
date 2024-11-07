"use client";

import { useEffect } from "react";
import { useOrientation } from "react-use";

import { createAtomStore } from "jotai-x";

import { useMounted } from "@/hooks/use-mounted";
import { useViewport } from "@/hooks/useViewport";
import { IS_MOBILE } from "@/lib/utils/environment";

// Keep up to date with tailwind.config.cjs
const breakpointSizes = {
  "2xl": 1400,
  lg: 1024,
  md: 768,
  sm: 640,
  xl: 1280,
};

export type Breakpoint = keyof typeof breakpointSizes;

export function TailwindEffect() {
  const setCurrentBreakpoints = useTailwindStore().set.currentBreakpoints();
  const { width } = useViewport();

  useEffect(() => {
    const currentBreakpoints = Object.entries(breakpointSizes)
      .filter(([, size]) => width >= size)
      .map(([breakpoint]) => breakpoint as Breakpoint);

    setCurrentBreakpoints(currentBreakpoints);
  }, [width, setCurrentBreakpoints]);

  return null;
}

export const { TailwindProvider, useTailwindStore } = createAtomStore(
  {
    currentBreakpoints: [] as Breakpoint[],
  },
  {
    effect: TailwindEffect,
    name: "tailwind",
  },
);

export const useIsMinBreakpoint = (breakpoint: Breakpoint, fallback = true) => {
  const mounted = useMounted();
  const currentBreakpoints = useTailwindStore().get.currentBreakpoints();

  if (!mounted) return fallback;

  return currentBreakpoints.includes(breakpoint);
};

export const useIsMaxBreakpoint = (breakpoint: Breakpoint, fallback = false) => {
  return !useIsMinBreakpoint(breakpoint, !fallback);
};

// Desktop device and > sm
export const useIsDesktop = () => useIsMinBreakpoint("md") && !IS_MOBILE;

// Mobile device or < md
export const useIsMobile = () => !useIsMinBreakpoint("md") || IS_MOBILE;

// Landscape orientation and < md
export const useIsLandscape = () => {
  const orientation = useOrientation();

  return orientation.type.includes("landscape");
};

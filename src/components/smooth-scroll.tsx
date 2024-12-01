"use client";

import { useStorage } from "@/hooks/use-storage";
import { type ReactNode, useEffect, useRef } from "react";

export const SmoothScroll = ({
  children,
  speed = 0.08,
}: {
  children: ReactNode;
  speed?: number;
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const smoothScrollRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);
  const { isSmoothScrolling } = useStorage();

  const lerp = (start: number, end: number, factor: number): number => {
    const diff = end - start;
    const dampingFactor = Math.abs(diff) < 0.1 ? 1 : factor;
    return start * (1 - dampingFactor) + end * dampingFactor;
  };

  useEffect(() => {
    if (!isSmoothScrolling) return;

    let scrollContainer: HTMLElement;
    let smoothScrollContainer: HTMLElement;
    let currentScroll = 0;
    let targetScroll = 0;

    const articleContainer = document.getElementById("scroll_container");

    if (articleContainer) {
      scrollContainer = articleContainer;
      smoothScrollContainer = articleContainer;
    } else {
      if (!scrollContainerRef.current || !smoothScrollRef.current) return;
      scrollContainer = scrollContainerRef.current;
      smoothScrollContainer = smoothScrollRef.current;
    }

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const maxScroll = smoothScrollContainer.scrollHeight - window.innerHeight;
      targetScroll = Math.max(0, Math.min(targetScroll + e.deltaY, maxScroll));
    };

    const smoothScrolling = (time: number) => {
      if (previousTimeRef.current !== null) {
        currentScroll = lerp(currentScroll, targetScroll, speed);
        scrollContainer.scrollTop = currentScroll;
      }
      previousTimeRef.current = time;
      requestRef.current = requestAnimationFrame(smoothScrolling);
    };

    requestRef.current = requestAnimationFrame(smoothScrolling);
    scrollContainer.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
      scrollContainer.removeEventListener("wheel", handleWheel);
    };
  }, [speed, isSmoothScrolling]);

  return <>{children}</>;
};

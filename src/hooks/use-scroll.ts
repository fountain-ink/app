import { useEffect, useRef, useState } from "react";

export const useScroll = () => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const element = document.getElementById("scroll_container");
    setContainer(element);
  }, []);

  useEffect(() => {
    if (!container) return;

    const handleScroll = () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      const currentScrollY = container.scrollTop;
      const direction = currentScrollY > lastScrollY.current ? "down" : "up";
      const delta = Math.abs(currentScrollY - lastScrollY.current);
      const step = delta / 125;

      setShouldAnimate(false);

      // Update progress smoothly while scrolling
      setScrollProgress((prev) => {
        if (direction === "down") {
          return Math.min(1, prev + step);
        }
        return Math.max(0, prev - step);
      });

      lastScrollY.current = currentScrollY;

      // Set timeout to snap when scrolling stops
      scrollTimeout.current = setTimeout(() => {
        setShouldAnimate(true);
        setScrollProgress((prev) => {
          // If scrolling down, snap to hidden (1) if progress > 0.2
          if (direction === "down") {
            return prev > 0.2 ? 1 : 0;
          }
          // If scrolling up, snap to visible (0) if progress < 0.8
          return prev < 0.8 ? 0 : 1;
        });
      }, 150);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }
    };
  }, [container]);

  return {
    scrollProgress,
    shouldAnimate,
    shouldShow: scrollProgress < 0.5,
  };
};

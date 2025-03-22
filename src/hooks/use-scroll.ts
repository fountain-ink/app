import { useEffect, useRef, useState } from "react";

interface UseScrollOptions {
  containerRef?: React.RefObject<HTMLElement>;
  containerSelector?: string;
}

export const useScroll = (options?: UseScrollOptions) => {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [shouldAnimate, setShouldAnimate] = useState(false);
  const lastScrollY = useRef(0);
  const scrollTimeout = useRef<NodeJS.Timeout>();
  const [container, setContainer] = useState<HTMLElement | Window | null>(null);

  useEffect(() => {
    if (options?.containerRef?.current) {
      setContainer(options.containerRef.current);
    }
    else if (options?.containerSelector) {
      const element = document.querySelector(options.containerSelector) as HTMLElement;
      setContainer(element || window);
    }
    else {
      setContainer(window);
    }
  }, [options?.containerRef, options?.containerSelector]);

  useEffect(() => {
    if (!container) return;

    const handleScroll = () => {
      if (scrollTimeout.current) {
        clearTimeout(scrollTimeout.current);
      }

      const currentScrollY = container === window
        ? window.scrollY
        : (container as HTMLElement).scrollTop;

      const direction = currentScrollY > lastScrollY.current ? "down" : "up";
      const delta = Math.abs(currentScrollY - lastScrollY.current);
      const step = delta / 125;

      setShouldAnimate(false);

      setScrollProgress((prev) => {
        if (direction === "down") {
          return Math.min(1, prev + step);
        }
        return Math.max(0, prev - step);
      });

      lastScrollY.current = currentScrollY;

      scrollTimeout.current = setTimeout(() => {
        setShouldAnimate(true);
        setScrollProgress((prev) => {
          if (direction === "down") {
            return prev > 0.2 ? 1 : 0;
          }
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

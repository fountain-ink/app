import { useCallback, useEffect, useState } from 'react';

export const useScroll = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollY, setPrevScrollY] = useState(0);

  const debounce = <T extends (...args: any[]) => void>(fn: T, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), wait);
    };
  };

  const handleScroll = useCallback(
    debounce(() => {
      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const isBottom = currentScrollY + clientHeight >= scrollHeight - 400;
      const isTop = currentScrollY < 400;

      const scrollDifference = Math.abs(currentScrollY - prevScrollY);

      if (isBottom || isTop) {
        setIsVisible(true);
      } else if (scrollDifference > 50) {
        setIsVisible(currentScrollY < prevScrollY);
      }

      setPrevScrollY(currentScrollY);
    }, 100),
    [prevScrollY]
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return isVisible;
};

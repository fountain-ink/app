import { useState, useEffect, useCallback } from 'react';

export const useScroll = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [prevScrollY, setPrevScrollY] = useState(0);

  const debounce = (func: Function, wait: number) => {
    let timeout: NodeJS.Timeout;
    return (...args: any[]) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  };

  const handleScroll = useCallback(
    debounce(() => {
      const currentScrollY = window.scrollY;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = document.documentElement.clientHeight;
      const isBottom = currentScrollY + clientHeight >= scrollHeight - 10;
      
      // Only trigger hide/show if scroll difference is more than 50px
      const scrollDifference = Math.abs(currentScrollY - prevScrollY);
      
      if (isBottom) {
        setIsVisible(true);
      } else if (scrollDifference > 50) {
        setIsVisible(currentScrollY < prevScrollY);
      }

      setPrevScrollY(currentScrollY);
    }, 100), // 100ms debounce
    [prevScrollY]
  );

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  return isVisible;
};

"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";

interface BlogTitleProps {
  title: string;
}

export function BlogTitle({ title }: BlogTitleProps) {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();
  const isIndexPage = pathname.split("/").length === 3;

  useEffect(() => {
    if (!isIndexPage) return;

    const handleScroll = () => {
      const titleElement = document.querySelector("[data-blog-title]");
      if (!titleElement) return;

      const rect = titleElement.getBoundingClientRect();
      // Show sticky title when original title is scrolled out of view
      setIsVisible(rect.bottom < 75);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll(); // Check initial position

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isIndexPage]);

  return (
    <div
      className={`fixed top-4 left-0 right-0 z-50 flex items-center justify-center transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="text-lg font-[family-name:var(--title-font)] font-normal font-[color:var(--title-color)] truncate max-w-[80%]">
        {title}
      </div>
    </div>
  );
} 
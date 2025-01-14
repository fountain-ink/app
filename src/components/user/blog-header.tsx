"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface BlogHeaderProps {
  title?: string;
  icon?: string;
}

export function BlogHeader({ title, icon }: BlogHeaderProps) {
  const [isVisible, setIsVisible] = useState(true);
  const pathname = usePathname();
  const isIndexPage = pathname.split("/").length === 3;

  useEffect(() => {
    if (!isIndexPage) return;

    const handleScroll = () => {
      const titleElement = document.querySelector("[data-blog-title]");
      if (!titleElement) return;

      const rect = titleElement.getBoundingClientRect();
      setIsVisible(rect.bottom < 75);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [isIndexPage]);

  return (
    <div
      className={`hidden sm:flex fixed top-4 left-0 right-0 z-50 items-center w-fit mx-auto justify-center transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
    >
      <div className="flex jusitfy-center items-center gap-2">
        {icon && <img src={icon} alt="Blog icon" className="w-6 h-6 -mt-1 rounded-[4px] object-cover" />}
        <div className="font-[family-name:var(--title-font)] text-lg font-normal font-[color:var(--title-color)] truncate">
          {title}
        </div>
      </div>
    </div>
  );
}

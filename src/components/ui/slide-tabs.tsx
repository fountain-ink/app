"use client";

import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  isVisible?: boolean;
  disabled?: boolean;
  rightElement?: React.ReactNode;
}

interface SlideNavProps {
  items: NavItem[];
  className?: string;
}

export function SlideNav({ items, className }: SlideNavProps) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = React.useState<HTMLElement | null>(null);

  const visibleItems = items.filter((item) => item.isVisible !== false);

  const isActive = (href: string) => {
    if (pathname === href) return true;
    if (href !== "/" && pathname.startsWith(href)) return true;
    return false;
  };

  return (
    <nav className={cn("relative flex justify-center", className)}>
      <div className="relative flex gap-4">
        {visibleItems.map((item) => (
          <div key={item.href} className="flex items-center">
            {item.disabled ? (
              <span
                className={cn(
                  "px-4 py-2 font-medium transition-colors relative cursor-not-allowed",
                  "text-muted-foreground/50",
                )}
              >
                {item.label}
                {item.rightElement}
              </span>
            ) : (
              <Link
                href={item.href}
                scroll={false}
                ref={(node) => {
                  if (node && isActive(item.href)) {
                    setActiveItem(node);
                  }
                }}
                prefetch
                className={cn(
                  "px-4 py-2 font-medium transition-colors relative",
                  isActive(item.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {item.label}
                {item.rightElement}
              </Link>
            )}
          </div>
        ))}
      </div>
      {activeItem && (
        <motion.div
          className="absolute bottom-0 left-0 h-0.5 bg-foreground"
          initial={{
            width: activeItem.offsetWidth,
            x: activeItem.offsetLeft,
          }}
          animate={{
            width: activeItem.offsetWidth,
            x: activeItem.offsetLeft,
          }}
          transition={{
            type: "spring",
            stiffness: 500,
            damping: 30,
          }}
        />
      )}
    </nav>
  );
}

"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";

interface NavItem {
  href: string;
  label: string;
  isVisible?: boolean;
}

interface SlideNavProps {
  items: NavItem[];
  className?: string;
}

export function SlideNav({ items, className }: SlideNavProps) {
  const pathname = usePathname();
  const [activeItem, setActiveItem] = React.useState<HTMLElement | null>(null);

  const visibleItems = items.filter((item) => item.isVisible !== false);

  return (
    <nav className={cn("relative flex justify-center", className)}>
      <div className="relative flex gap-4">
        {visibleItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            ref={(node) => {
              if (node && pathname === item.href) {
                setActiveItem(node);
              }
            }}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors relative",
              pathname === item.href ? "text-foreground" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {item.label}
          </Link>
        ))}
      </div>
      {activeItem && (
        <motion.div
          layoutId="navunderline"
          className="absolute bottom-0 left-0 h-0.5 bg-foreground"
          initial={false}
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

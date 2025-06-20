"use client";

import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  enabled: boolean;
}

interface TabNavigationProps {
  navItems: NavItem[];
  basePath?: string;
}

export function TabNavigation({ navItems, basePath = "/settings" }: TabNavigationProps) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col w-48 p-2 gap-2">
      {navItems.map((item) => {
        const isActive = pathname === `${basePath}/${item.id}`;
        return (
          <motion.div
            key={item.id}
            whileHover={{ scale: item.enabled ? 1.02 : 1 }}
            whileTap={{ scale: item.enabled ? 0.98 : 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
          >
            <Link
              href={`${basePath}/${item.id}`}
              className={`px-2 md:px-4 py-2 flex items-center justify-between rounded-lg text-sm font-medium transition-colors
                ${
                  item.enabled
                    ? isActive
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-accent hover:text-accent-foreground"
                    : "opacity-50 cursor-not-allowed"
                }`}
              onClick={(e) => {
                if (!item.enabled) e.preventDefault();
              }}
            >
              <div className="flex items-center space-x-2">
                {item.icon && <item.icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{item.label}</span>
              </div>

              <span className="hidden lg:inline">{!item.enabled && <Badge variant="outline">Soon</Badge>}</span>
            </Link>
          </motion.div>
        );
      })}
    </nav>
  );
}

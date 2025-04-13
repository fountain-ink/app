"use client";

import { Badge } from "@/components/ui/badge";
import {
  Settings,
  ChartLine,
  Search,
  MessageSquare,
  FileCog,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { id: "controls", label: "App Controls", icon: FileCog, enabled: true },
  { id: "stats", label: "Stats", icon: ChartLine, enabled: true },
  { id: "lookup", label: "Lookup", icon: Search, enabled: true },
  { id: "feedback", label: "Feedback", icon: MessageSquare, enabled: true },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isFeedbackPage = pathname === "/admin/feedback";

  return (
    <div className={`container-fluid p-4 sm:px-6`}>
      <h1 className="text-3xl font-bold ml-4 mb-10">Admin Portal</h1>
      <div className="flex flex-row sm:gap-2 lg:gap-4">
        <nav className="flex flex-col lg:w-1/5 p-2 gap-2">
          {navItems.map((item) => {
            const isActive = pathname === `/admin/${item.id}`;
            return (
              <Link
                key={item.id}
                href={`/admin/${item.id}`}
                className={`px-2 md:px-4 py-2 flex items-center justify-between rounded-lg text-sm font-medium transition-colors
                  ${item.enabled
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
            );
          })}
        </nav>
        <div className={`${isFeedbackPage ? 'w-full' : 'flex-1'}`}>{children}</div>
      </div>
    </div>
  );
} 
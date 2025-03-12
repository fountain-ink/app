"use client";

import { Badge } from "@/components/ui/badge";
import {
  Brush,
  DollarSign,
  LayoutGrid,
  Mail,
  PenTool,
  Settings,
  User2,
  Users,
  BookOpen,
  FileCog,
  FileSliders,
  ChartLine,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { id: "profile", label: "Profile", icon: User2, enabled: true },
  { id: "blogs", label: "Blogs", icon: PenTool, enabled: true },
  { id: "app", label: "Application", icon: Settings, enabled: true },
  { id: "newsletter", label: "Newsletter", icon: Mail, enabled: true },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: DollarSign,
    enabled: false,
  },
  { id: "editor", label: "Editor", icon: FileSliders, enabled: false },
  { id: "stats", label: "Stats", icon: ChartLine, enabled: false },
  { id: "team", label: "Team", icon: Users, enabled: false },
  { id: "layouts", label: "Layouts", icon: LayoutGrid, enabled: false },
];

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="container mx-auto p-0 sm:p-6 sm:py-10 max-w-6xl">
      <h1 className="text-3xl font-bold ml-4 mb-10">Settings</h1>
      <div className="flex flex-row sm:gap-2 lg:gap-4">
        <nav className="flex flex-col lg:w-1/5 p-2 gap-2">
          {navItems.map((item) => {
            const isActive = pathname === `/settings/${item.id}`;
            return (
              <Link
                key={item.id}
                href={`/settings/${item.id}`}
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
            );
          })}
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

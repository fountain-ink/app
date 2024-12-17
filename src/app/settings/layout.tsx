"use client";

import { Brush, DollarSign, FileText, LayoutGrid, Mail, Megaphone, Settings, Users } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { id: "app", label: "Application", icon: Settings, enabled: true },
  { id: "profile", label: "Profile", icon: FileText, enabled: true },
  { id: "theme", label: "Theme", icon: Brush, enabled: true },
  {
    id: "subscriptions",
    label: "Subscriptions",
    icon: DollarSign,
    enabled: false,
  },
  {
    id: "advertising",
    label: "Advertising",
    icon: Megaphone,
    enabled: false,
  },
  { id: "newsletter", label: "Newsletter", icon: Mail, enabled: false },
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
    <div className="container mx-auto p-6 py-10 mt-16 max-w-6xl">
      <h1 className="text-3xl font-bold ml-4 mb-10">Settings</h1>
      <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
        <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-2 lg:w-1/5">
          {navItems.map((item) => {
            const isActive = pathname === `/settings/${item.id}`;
            return (
              <Link
                key={item.id}
                href={`/settings/${item.id}`}
                className={`px-4 py-2 flex items-center space-x-2 rounded-lg text-sm font-medium transition-colors
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
                {item.icon && <item.icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

"use client";

import { Mail, PenTool, Settings, User2 } from "lucide-react";
import { TabNavigation } from "@/components/navigation/tab-navigation";

const navItems = [
  { id: "profile", label: "Profile", icon: User2, enabled: true },
  { id: "blogs", label: "Blogs", icon: PenTool, enabled: true },
  { id: "app", label: "Application", icon: Settings, enabled: true },
  { id: "newsletter", label: "Newsletters", icon: Mail, enabled: true },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="container mx-auto p-2 pt-6 sm:p-6 sm:py-10 max-w-6xl">
      <h1 className="text-3xl font-bold ml-4 mb-10">Settings</h1>
      <div className="flex flex-row sm:gap-2 lg:gap-4">
        <TabNavigation navItems={navItems} />
        <div className="flex-1">{children}</div>
      </div>
    </div>
  );
}

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User2, FileText, BookOpen } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  { id: "users", label: "Users", icon: User2 },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "blogs", label: "Blogs", icon: BookOpen },
];

export default function LookupLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentTab = pathname.split("/").pop() || "users";
  const title = tabs.find((tab) => tab.id === currentTab)?.label || "Lookup";

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>{title} Lookup</CardTitle>
          <CardDescription>Search and manage {title.toLowerCase()}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">{children}</CardContent>
      </Card>
    </div>
  );
}

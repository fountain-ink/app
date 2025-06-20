"use client";

import { BookOpen, FileText, User2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

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

"use client";

import { Badge } from "@/components/ui/badge";
import {
  ChartLine,
  Search,
  MessageSquare,
  FileCog,
  User2,
  FileText,
  BookOpen,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from "@/components/ui/collapsible";
import { useState, useEffect } from "react";

const navItems = [
  { id: "controls", label: "App Controls", icon: FileCog, enabled: false },
  { id: "feedback", label: "Feedback", icon: MessageSquare, enabled: true },
  { id: "stats", label: "Stats", icon: ChartLine, enabled: true },
];

const lookupSubItems = [
  { id: "users", label: "Users", icon: User2 },
  { id: "drafts", label: "Drafts", icon: FileText },
  { id: "blogs", label: "Blogs", icon: BookOpen },
];

export default function AdminNavigation() {
  const pathname = usePathname();
  const isLookupSection = pathname.startsWith("/admin/lookup");
  const [lookupOpen, setLookupOpen] = useState(isLookupSection);

  useEffect(() => {
    if (isLookupSection && !lookupOpen) {
      setLookupOpen(true);
    }
  }, [pathname, isLookupSection, lookupOpen]);

  return (
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

      {/* Lookup section with sub-navigation */}
      <Collapsible open={lookupOpen} onOpenChange={setLookupOpen} className="w-full">
        <CollapsibleTrigger className={`px-2 md:px-4 py-2 flex items-center justify-between rounded-lg text-sm font-medium transition-colors w-full
          ${isLookupSection
            ? "bg-primary text-primary-foreground"
            : "hover:bg-accent hover:text-accent-foreground"}`}>
          <div className="flex items-center space-x-2">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Lookup</span>
          </div>
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className={`transition-transform ${lookupOpen ? 'rotate-180' : ''}`}
          >
            <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </CollapsibleTrigger>
        <CollapsibleContent className="pl-4 mt-1 space-y-1 overflow-hidden">
          {lookupSubItems.map((item) => {
            const subPath = `/admin/lookup/${item.id}`;
            const isActive = pathname === subPath;
            return (
              <Link
                key={item.id}
                href={subPath}
                className={`px-2 md:px-4 py-2 flex items-center rounded-lg text-sm font-medium transition-colors
                ${isActive
                    ? "bg-primary/10 text-primary"
                    : "hover:bg-accent hover:text-accent-foreground"
                  }`}
              >
                <div className="flex items-center space-x-2">
                  {item.icon && <item.icon className="w-4 h-4" />}
                  <span className="hidden sm:inline">{item.label}</span>
                </div>
              </Link>
            );
          })}
        </CollapsibleContent>
      </Collapsible>
    </nav>
  );
} 
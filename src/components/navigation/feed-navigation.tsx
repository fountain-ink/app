"use client";

import { SlideNav } from "@/components/ui/slide-tabs";
import { useAuthenticatedUser } from "@lens-protocol/react";

export const FeedNavigation = () => {
  const { data: authenticatedUser, loading } = useAuthenticatedUser();
  const isLoggedIn = !!authenticatedUser && !loading;

  const navItems = [
    {
      href: "/featured",
      label: "Featured",
    },
    {
      href: "/home",
      label: "Latest",
    },
  ];

  // Only show bookmarks tab for logged-in users
  if (isLoggedIn) {
    navItems.push({
      href: "/bookmarks",
      label: "Bookmarks",
    });
  }

  return (
    <div className="p-4 pb-0 font-[family-name:var(--title-font)] border-b border-border w-full max-w-3xl">
      <SlideNav
        items={navItems}
        className="w-fit"
      />
    </div>
  );
}; 
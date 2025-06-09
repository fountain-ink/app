"use client"

import { SlideNav } from "@/components/ui/slide-tabs";
import { useAuthenticatedUser } from "@lens-protocol/react";

export const FeedNavigation = () => {
  const { data: user, loading } = useAuthenticatedUser();
  const isLoggedIn = !!user && !loading;

  return (
    <div className="p-4 pb-0 font-[family-name:var(--title-font)] border-b border-border w-full">
      <SlideNav
        items={[
          {
            href: "/featured",
            label: "Featured",
          },
          {
            href: "/home",
            label: "Latest",
          },
          {
            href: "/bookmarks",
            label: "Bookmarks",
            isVisible: isLoggedIn,
          },
        ]}
        className="w-fit"
      />
    </div>
  );
};

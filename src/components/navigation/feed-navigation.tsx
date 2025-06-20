"use client";

import { useAuthenticatedUser } from "@lens-protocol/react";
import { SlideNav } from "@/components/ui/slide-tabs";

export const FeedNavigation = () => {
  const { data: user, loading } = useAuthenticatedUser();
  const isLoggedIn = !!user && !loading;

  return (
    <div className="p-4 py-0 font-[family-name:var(--title-font)] border-b border-border w-full">
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
            href: "/contests",
            label: "Contests",
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

"use client";

import { SlideNav } from "../ui/slide-tabs";

export const UserNavigation = ({ username, isUserProfile }: { username: string; isUserProfile: boolean }) => {
  return (
    <SlideNav
      items={[
        {
          href: `/u/${username}`,
          label: "Posts",
        },
        // {
        //   href: `/u/${username}/all`,
        //   label: "Activity",
        //   disabled: true,
        // },
        // {
        //   href: `/u/${username}/comments`,
        //   label: "Comments",
        //   disabled: true,
        // },
        {
          href: `/u/${username}/bookmarks`,
          label: "Bookmarks",
          isVisible: isUserProfile,
        },
        {
          href: `/u/${username}/drafts`,
          label: "Drafts",
          isVisible: isUserProfile,
        },
      ]}
      className="w-fit"
    />
  );
};

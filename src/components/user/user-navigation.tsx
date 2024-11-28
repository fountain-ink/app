"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

export const UserNavigation = ({ username, isUserProfile }: { username: string; isUserProfile: boolean }) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-row gap-4">
      <Link href={`/${username}`} prefetch>
        <Button variant={pathname === `/${username}` ? "ghost2" : "ghost"} className="">
          Published
        </Button>
      </Link>

      <Link href={`/${username}/all`} prefetch>
        <Button variant={pathname === `/${username}/all` ? "ghost2" : "ghost"} className="">
          All
        </Button>
      </Link>

      {isUserProfile && (
        <Link href={`/${username}/drafts` } prefetch>
          <Button variant={pathname === `/${username}/drafts` ? "ghost2" : "ghost"} className="">
            Drafts
          </Button>
        </Link>
      )}
    </div>
  );
};

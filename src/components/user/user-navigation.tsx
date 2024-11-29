"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

export const UserNavigation = ({ username, isUserProfile }: { username: string; isUserProfile: boolean }) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-row gap-4">
      <Link href={`/u/${username}`} prefetch>
        <Button variant={pathname === `/u/${username}` ? "ghost2" : "ghost"} className="">
          Published
        </Button>
      </Link>

      <Link href={`/u/${username}/all`} prefetch>
        <Button variant={pathname === `/u/${username}/all` ? "ghost2" : "ghost"} className="">
          All
        </Button>
      </Link>

      {isUserProfile && (
        <Link href={`/u/${username}/drafts`} prefetch>
          <Button variant={pathname === `/u/${username}/drafts` ? "ghost2" : "ghost"} className="">
            Drafts
          </Button>
        </Link>
      )}
    </div>
  );
};

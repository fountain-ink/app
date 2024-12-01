"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "../ui/button";

export const IndexNavigation = ({ username, isUserProfile }: { username: string; isUserProfile: boolean }) => {
  const pathname = usePathname();

  return (
    <div className="flex flex-row gap-4 font-[family-name:--title-font]">
      <Link href={`/u/${username}`} prefetch>
        <Button variant={pathname === `/u/${username}` ? "ghost2" : "ghost"} className="">
          All
        </Button>
      </Link>
    </div>
  );
};

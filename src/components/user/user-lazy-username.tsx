"use client";

import Link from "next/link";
import { UserCard } from "./user-card";

export const UserLazyUsername = ({ username }: { username: string }) => {
  const localName = username.toLowerCase();
  return (
    <UserCard username={localName}>
      <Link
        className="no-underline hover:underline font-semibold text-primary decoration-2 underline-offset-4"
        onClick={(e) => e.stopPropagation()}
        href={`/u/${localName}`}
        prefetch
      >
        @{username}
      </Link>
    </UserCard>
  );
};

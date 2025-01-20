"use client";

import Link from "next/link";
import { UserCard } from "./user-card";

export const UserLazyUsername = ({ username }: { username: string }) => {
  return (
    <UserCard username={username}>
      <Link
        className="no-underline hover:underline font-semibold text-primary decoration-2 underline-offset-4"
        onClick={(e) => e.stopPropagation()}
        href={`/u/${username}`}
        prefetch
      >
        @{username}
      </Link>
    </UserCard>
  );
};

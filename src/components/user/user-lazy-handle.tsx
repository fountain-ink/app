"use client";

import Link from "next/link";
import { UserCard } from "./user-card";

export const UserLazyHandle = ({ handle }: { handle: string }) => {
  return (
    <UserCard handle={handle}>
      <Link
        className="no-underline hover:underline font-semibold text-primary decoration-2 underline-offset-4"
        onClick={(e) => e.stopPropagation()}
        href={`/u/${handle}`}
        prefetch
      >
        @{handle}
      </Link>
    </UserCard>
  );
};

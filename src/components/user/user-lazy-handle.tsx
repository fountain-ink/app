"use client";

import Link from "next/link";
import { UserCard } from "./user-card";

export const UserLazyHandle = ({ handle }: { handle: string }) => {
  return (
    <UserCard handle={handle}>
      <Link onClick={(e) => e.stopPropagation()} href={`/${handle}`} prefetch>
        @{handle}
      </Link>
    </UserCard>
  );
};

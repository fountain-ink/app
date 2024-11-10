"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SessionType, useSession } from "@lens-protocol/react-web";
import { FileTextIcon } from "lucide-react";
import Link from "next/link";
import { useAccount } from "wagmi";
import { DraftCreate } from "../draft/draft-create";
import { SquarePenIcon } from "../icons/square-pen";

export const WriteMenu = ({ text = "Write" }: { text?: string }) => {
  const { data: session, loading, error } = useSession();
  const { isConnected: isWalletConnected } = useAccount();

  if (loading || error) {
    return null;
  }

  if (session?.type !== SessionType.WithProfile || !isWalletConnected) {
    return <DraftCreate isLocal={true} text="Write" />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>{text}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1" align="end">
        <DropdownMenuItem asChild>
          <DraftCreate isLocal={false} text="New Article" variant="ghost" />
        </DropdownMenuItem>
        <DropdownMenuItem className="p-0 mx-0">
          <Link href="/drafts" className="w-full">
            <Button variant="ghost" className="w-full justify-start flex gap-2 text-md h-10 px-4 py-2 ">
              <SquarePenIcon />
              <span className="grow text-left">Drafts</span>
            </Button>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

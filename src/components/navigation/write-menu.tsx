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

export const WriteMenu = ({ text = "Write" }: { text?: string }) => {
  const { data: session, loading, error } = useSession();
  const { isConnected: isWalletConnected } = useAccount();

  if (loading || error) {
    return null;
  }

  if (session?.type !== SessionType.WithProfile || !isWalletConnected) {
    return <DraftCreate />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>{text}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <DraftCreate variant="ghost" />
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/drafts">
            <Button className="flex gap-2" variant="ghost">
              <FileTextIcon className="h-5 w-5" />
              My Drafts
            </Button>
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

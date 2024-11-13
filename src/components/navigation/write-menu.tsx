"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SessionType, useSession } from "@lens-protocol/react-web";
import { useAccount } from "wagmi";
import { NewLocalDraftButton, RemoteDraftCreate } from "../draft/draft-create";
import { SquarePenIcon } from "../icons/square-pen";
import { AnimatedMenuItem } from "./animated-item";

export const WriteMenu = ({ text = "Write" }: { text?: string }) => {
  const { data: session, loading, error } = useSession();
  const { isConnected: isWalletConnected } = useAccount();

  if (loading || error) {
    return null;
  }

  if (session?.type !== SessionType.WithProfile || !isWalletConnected) {
    return <NewLocalDraftButton />;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>{text}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="p-1" align="end">
        <DropdownMenuItem asChild>
          <RemoteDraftCreate />
        </DropdownMenuItem>
        <AnimatedMenuItem href="/drafts" icon={SquarePenIcon}>
          Drafts
        </AnimatedMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SessionType, useSession } from "@lens-protocol/react-web";
import { useAccount } from "wagmi";
import { NewLocalDraftButton, RemoteDraftCreate } from "../draft/draft-create-button";
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

  const handle = session?.profile.handle?.localName;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button>{text}</Button>
      </DropdownMenuTrigger>
      <DropdownMenuPortal>
        <DropdownMenuContent className="w-40" align="end">
          <DropdownMenuItem asChild>
            <RemoteDraftCreate />
          </DropdownMenuItem>
          <AnimatedMenuItem href={`/u/${handle}/drafts`} icon={SquarePenIcon}>
            Drafts
          </AnimatedMenuItem>
        </DropdownMenuContent>
      </DropdownMenuPortal>
    </DropdownMenu>
  );
};

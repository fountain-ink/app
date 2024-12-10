"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";
import { useAccount } from "wagmi";
import { NewLocalDraftButton, RemoteDraftCreate } from "../draft/draft-create-button";

export const WriteMenu = ({ text = "Write" }: { text?: string }) => {
  const { data: session, loading, error } = useSession();
  const { isConnected: isWalletConnected } = useAccount();

  if (loading || error) {
    return null;
  }

  if (session?.type !== SessionType.WithProfile || !isWalletConnected) {
    return <NewLocalDraftButton />;
  }

  return <RemoteDraftCreate />;
};

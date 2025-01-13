"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";
import { LoadingSpinner } from "../../misc/loading-spinner";
import { Badge } from "../../ui/badge";
import { LazyAuthorView } from "../../user/user-author-view";
import { EvmAddress } from "@lens-protocol/metadata";

export const EditorCollaborators = () => {
  const { data: session, loading, error } = useSession();

  if (session?.type !== SessionType.WithProfile) {
    return (
      <Badge className="mb-5 mt-4" variant="secondary">
        Login to save changes
      </Badge>
    );
  }
  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="flex flex-row gap-4  justify-center items-center py-2">
      <LazyAuthorView profileIds={[session.address as EvmAddress]} />
    </div>
  );
};

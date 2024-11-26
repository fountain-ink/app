"use client";

import { SessionType, useSession } from "@lens-protocol/react-web";
import { LoadingSpinner } from "../../loading-spinner";
import { Badge } from "../../ui/badge";
import { UserAuthorView } from "../../user/user-author-view";

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
      <UserAuthorView profileIds={[session.profile.id]} />
    </div>
  );
};

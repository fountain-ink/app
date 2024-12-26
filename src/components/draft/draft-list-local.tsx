"use client";

import { useDocumentStorage } from "@/hooks/use-document-storage";
import { SessionType, useSession } from "@lens-protocol/react-web";
import { LoadingSpinner } from "../misc/loading-spinner";
import { DraftView } from "./draft-view";

export function LocalDraftsList() {
  const { data: session, loading: sessionLoading } = useSession();
  const { documents: localDrafts } = useDocumentStorage();

  if (sessionLoading) return <LoadingSpinner />;
  if (session?.type !== SessionType.WithProfile) return null;

  const localDraftsList = Object.values(localDrafts);

  if (!localDraftsList.length) {
    return <div>No local drafts available</div>;
  }

  return (
    <div className="space-y-4">
      {localDraftsList.map((draft) => (
        <DraftView key={draft.documentId} draft={draft} authorId={session.profile.id} isLocal={true} />
      ))}
    </div>
  );
}

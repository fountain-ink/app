"use client";

import { useStorage } from "@/hooks/use-storage";
import { type ProfileId, SessionType, useSession } from "@lens-protocol/react-web";
import { useQuery } from "@tanstack/react-query";
import { LoadingSpinner } from "../loading-spinner";
import { DraftView } from "./draft-view";
import type { Draft } from "./draft";

const fetchCloudDrafts = async () => {
  const response = await fetch("/api/drafts", {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
    },
  });
  const data = await response.json();
  return data.drafts;
};

export const DraftsList = () => {
  const { data: session, loading: sessionLoading } = useSession();
  const { documents: localDrafts } = useStorage();

  const {
    data: cloudDrafts,
    isLoading: cloudDraftsLoading,
    error: cloudDraftsError,
  } = useQuery<Draft[]>({
    queryKey: ["drafts"],
    queryFn: fetchCloudDrafts,
  });

  if (sessionLoading) return <LoadingSpinner />;
  if (session?.type !== SessionType.WithProfile) return null;
  if (cloudDraftsError) return <div>Error loading drafts: {cloudDraftsError.message}</div>;

  const cloudDraftsList = cloudDrafts || [];
  const localDraftsList = Object.values(localDrafts);

  const allDrafts = [...cloudDraftsList, ...localDraftsList];
  const profileId = session?.profile.id;

  return (
    <div className="space-y-4">
      {cloudDraftsLoading ? (
        <LoadingSpinner />
      ) : allDrafts.length === 0 ? (
        <div>No drafts available</div>
      ) : (
        allDrafts.map((draft) => (
          <DraftView key={draft.documentId} draft={draft} authorId={(draft.authorId || profileId) as ProfileId} isLocal={draft.isLocal} />
        ))
      )}
    </div>
  );
};

import { getBaseUrl } from "@/lib/get-base-url";
import type { ProfileId } from "@lens-protocol/react-web";
import type { Draft } from "./draft";
import { DraftView } from "./draft-view";
import { cookies } from "next/headers";

async function getCloudDrafts() {
  const url = getBaseUrl();
  const refreshToken = cookies().get("refreshToken")?.value;
  const response = await fetch(`${url}/api/drafts`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: `refreshToken=${refreshToken}`,
    },
  });

  const data = await response.json();
  return data.drafts;
}

export async function CloudDraftsList({ profileId }: { profileId: string | null | undefined }) {
  if (!profileId) {
    return <div>Please login to see your drafts</div>;
  }
  const cloudDrafts = await getCloudDrafts();

  if (!cloudDrafts.length) {
    return <div>No cloud drafts available</div>;
  }

  return (
    <>
      {cloudDrafts.map((draft: Draft) => (
        <DraftView
          key={draft.documentId}
          draft={draft}
          authorId={(draft.authorId || profileId) as ProfileId}
          isLocal={false}
        />
      ))}
    </>
  );
}

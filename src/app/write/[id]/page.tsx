import { EditorPublishing } from "@/components/editor/editor-publishing";
import Editor from "@/components/editor/plate-editor";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";
import { getTokenFromCookie } from "@/lib/auth/get-token-from-cookie";
import { getBaseUrl } from "@/lib/get-base-url";
import { cookies } from "next/headers";

async function getDraft(id: string) {
  const isLocal = id.startsWith("local-");

  if (isLocal) {
    return null;
  }

  const url = getBaseUrl();
  const refreshToken = cookies().get("refreshToken")?.value;

  const response = await fetch(`${url}/api/drafts?id=${id}`, {
    method: "GET",
    headers: {
      Cookie: `refreshToken=${refreshToken}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch draft ${await response.text()} ${response.statusText}`);
  }

  const { draft } = await response.json();
  return draft;
}

export default async function WriteDraft({ params }: { params: { id: string } }) {
  const { refreshToken } = getTokenFromCookie();
  const { profileId, handle } = await getAuthWithCookies();

  return (
    <Editor showToc refreshToken={refreshToken} handle={handle}>
      <EditorPublishing />
    </Editor>
  );
}

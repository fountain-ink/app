import { EditorPublishing } from "@/components/editor/editor-publishing";
import Editor from "@/components/editor/plate-editor";
import { getAuthWithCookies } from "@/lib/get-auth-clients";
import { getBaseUrl } from "@/lib/get-base-url";
import { getTokenFromCookie } from "@/lib/get-token-from-cookie";
import { proseClasses } from "@/styles/prose";
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
    <div
      className={`text-foreground bg-background max-w-full w-screen h-screen overflow-y-auto relative
        [&_.slate-selection-area]:border [&_.slate-selection-area]:border-primary [&_.slate-selection-area]:bg-primary/10
        ${proseClasses}`}
      id="scroll_container"
      data-plate-selectable="true"
    >
      <Editor showToc applyMargins refreshToken={refreshToken} handle={handle}>
        <EditorPublishing />
      </Editor>
    </div>
  );
}

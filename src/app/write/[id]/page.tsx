import { Editor } from "@/components/editor/editor";
import { AutoSave } from "@/components/editor/editor-auto-save";
import { EditorPublishing } from "@/components/editor/editor-publishing";
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
  const isLocal = params.id.startsWith("local-");
  const draft = isLocal ? null : await getDraft(params.id);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-foreground bg-background">
      <div className="container flex flex-col items-center justify-center w-full max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className="w-full min-h-screen py-4 my-24">
          <Editor initialContent={isLocal ? undefined : draft.contentJson} documentId={params.id}>
            <EditorPublishing />
            <AutoSave isLocal={isLocal} documentId={params.id} />
          </Editor>
        </div>
      </div>
    </div>
  );
}

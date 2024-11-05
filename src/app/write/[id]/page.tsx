import { EditorPublishing } from "@/components/editor/editor-publishing";
import Editor from "@/components/editor/plate-editor";
import { getAuth } from "@/lib/get-auth-clients";
import { getCookieAuth } from "@/lib/get-auth-cookies";
import { getBaseUrl } from "@/lib/get-base-url";
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
  const { refreshToken } = getCookieAuth();
  const { profileId, handle } = await getAuth();

  console.log(profileId, handle, refreshToken);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center text-foreground bg-background">
      <div className="container flex flex-col items-center justify-center w-full max-w-lg md:max-w-xl lg:max-w-2xl">
        <div className="w-full min-h-screen py-4 my-20">
          <div className={proseClasses}>
            <Editor refreshToken={refreshToken} handle={handle}>
              <EditorPublishing />
            </Editor>
          </div>
        </div>
      </div>
    </div>
  );
}

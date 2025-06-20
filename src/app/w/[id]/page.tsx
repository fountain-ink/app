import { headers } from "next/headers";
import Editor from "@/components/editor/editor";
import { ArticleLayout } from "@/components/navigation/article-layout";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { createClient } from "@/lib/db/server";
import { defaultContent } from "@/lib/plate/default-content";

export default async function WriteDraft({ params }: { params: { id: string } }) {
  const { username } = await getUserAccount();
  const appToken = getAppToken();
  const pathname = headers().get("x-url") ?? undefined;

  const db = await createClient();
  const { data: draft } = await db.from("drafts").select("contentJson,yDoc").eq("documentId", params.id).single();

  const content = draft?.contentJson ?? defaultContent;
  const collaborative = !!draft?.yDoc;

  return (
    <ArticleLayout>
      <Editor
        showToc
        pathname={pathname}
        username={username}
        appToken={appToken}
        value={JSON.stringify(content)}
        collaborative={collaborative}
      />
    </ArticleLayout>
  );
}

import Editor from "@/components/editor/editor";
import { ArticleLayout } from "@/components/navigation/article-layout";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { headers } from "next/headers";
import { createClient } from "@/lib/db/server";

export default async function WriteDraft({ params }: { params: { id: string } }) {
  const { username } = await getUserAccount();
  const db = await createClient();
  const { data } = await db.from("drafts").select("contentJson, yDoc").eq("documentId", params.id).single();

  const isCollaborative = !!data?.yDoc;
  const appToken = isCollaborative ? getAppToken() : undefined;
  const pathname = headers().get("x-url") ?? undefined;
  const value = data?.contentJson ? JSON.stringify(data.contentJson) : undefined;

  return (
    <ArticleLayout>
      <Editor
        showToc
        pathname={pathname}
        username={username}
        appToken={appToken}
        value={value}
        isCollaborative={false}
      />
    </ArticleLayout>
  );
}

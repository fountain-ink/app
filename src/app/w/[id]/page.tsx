import Editor from "@/components/editor/editor";
import { ArticleLayout } from "@/components/navigation/article-layout";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { headers } from "next/headers";

export default async function WriteDraft({ params }: { params: { id: string } }) {
  const { username } = await getUserAccount();
  const appToken = getAppToken();
  const pathname = headers().get("x-url") ?? undefined;

  return (
    <ArticleLayout>
      <Editor showToc pathname={pathname} username={username} appToken={appToken} />
    </ArticleLayout>
  );
}

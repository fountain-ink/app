import { PublishDialog } from "@/components/editor/addons/editor-publish-dialog";
import Editor from "@/components/editor/editor";
import { ArticleLayout } from "@/components/navigation/article-layout";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";
import { getTokenFromCookie } from "@/lib/auth/get-token-from-cookie";
import { headers } from "next/headers";

export default async function WriteDraft({ params }: { params: { id: string } }) {
  const { refreshToken } = getTokenFromCookie();
  const { handle } = await getAuthWithCookies();
  const pathname = headers().get("x-url") ?? undefined;

  return (
    <ArticleLayout>
      <Editor showToc pathname={pathname} refreshToken={refreshToken} handle={handle}>
        <PublishDialog />
      </Editor>
    </ArticleLayout>
  );
}

import { PublishDialog } from "@/components/editor/addons/editor-publish-dialog";
import Editor from "@/components/editor/editor";
import { ArticleLayout } from "@/components/navigation/article-layout";
import { getAuthTokens } from "@/lib/auth/get-auth-tokens";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { headers } from "next/headers";

export default async function WriteDraft({ params }: { params: { id: string } }) {
  const lens = await getLensClient();
  const { handle } = await getUserProfile();
  const { refreshToken, appToken } = getAuthTokens();
  const pathname = headers().get("x-url") ?? undefined;

  return (
    <ArticleLayout>
      <Editor showToc pathname={pathname} handle={handle} refreshToken={refreshToken} appToken={appToken}>
        <PublishDialog />
      </Editor>
    </ArticleLayout>
  );
}

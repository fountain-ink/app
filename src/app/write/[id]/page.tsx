import { PublishDialog } from "@/components/editor/addons/editor-publish-dialog";
import Editor from "@/components/editor/editor";
import { ArticleLayout } from "@/components/navigation/article-layout";
import { getAuthTokens } from "@/lib/auth/get-auth-tokens";
import { createLensClient } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { headers } from "next/headers";

export default async function WriteDraft({ params }: { params: { id: string } }) {
  const lens = await createLensClient();
  const { handle } = await getUserProfile(lens);
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

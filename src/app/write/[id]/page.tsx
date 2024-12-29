import { PublishDialog } from "@/components/editor/addons/editor-publish-dialog";
import Editor from "@/components/editor/editor";
import { ArticleLayout } from "@/components/navigation/article-layout";
import { getLensClientWithCookies } from "@/lib/auth/get-lens-client";
import { getTokenFromCookie } from "@/lib/auth/get-token-from-cookie";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { headers } from "next/headers";

export default async function WriteDraft({ params }: { params: { id: string } }) {
  const { refreshToken } = getTokenFromCookie();
  const lens = await getLensClientWithCookies();
  const { handle } = await getUserProfile(lens);

  const pathname = headers().get("x-url") ?? undefined;

  return (
    <ArticleLayout>
      <Editor showToc pathname={pathname} refreshToken={refreshToken} handle={handle}>
        <PublishDialog />
      </Editor>
    </ArticleLayout>
  );
}

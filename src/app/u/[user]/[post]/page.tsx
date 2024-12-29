import Editor from "@/components/editor/editor";
import ErrorPage from "@/components/misc/error-page";
import Markdown from "@/components/misc/markdown";
import { getLensClientWithCookies } from "@/lib/auth/get-lens-client";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { sanitize } from "isomorphic-dompurify";

const post = async ({ params }: { params: { user: string; post: string } }) => {
  const lens = await getLensClientWithCookies();
  // const { profileId, handle: userHandle } = await getUserProfile(lens);

  const id = params.post;
  const post = await lens.publication.fetch({ forId: id });

  if (!post) return <ErrorPage error="Couldn't find post to show" />;
  if (post.__typename === "Mirror" || post.metadata.__typename === "EventMetadataV3") {
    return null;
  }

  if (post.metadata.appId !== "fountain") {
    const markdown = post?.metadata?.content;

    return <Markdown content={markdown} />;
  }

  if (post.metadata.appId === "fountain") {
    const contentJson = post?.metadata?.attributes?.find((attr: any) => attr.key === "contentJson")?.value;
    const contentHtml = post?.metadata?.attributes?.find((attr: any) => attr.key === "contentHtml")?.value;

    if (contentJson) {
      return <Editor showToc value={contentJson} readOnly={true} />;
    }

    if (contentHtml) {
      return (
        <div
          // biome-ignore lint/security/noDangerouslySetInnerHtml: intended use
          dangerouslySetInnerHTML={{ __html: sanitize(contentHtml) }}
        />
      );
    }
  }

  return <ErrorPage error="Couldn't find content to show" />;
};

export default post;

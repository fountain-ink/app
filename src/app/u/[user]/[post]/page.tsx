import Editor from "@/components/editor/editor";
import ErrorPage from "@/components/misc/error-page";
import Markdown from "@/components/misc/markdown";
import { getLensClient } from "@/lib/lens/client";
import { fetchPost } from "@lens-protocol/client/actions";
import { sanitize } from "isomorphic-dompurify";

const post = async ({ params }: { params: { user: string; post: string } }) => {
  const lens = await getLensClient();
  // const { profileId, handle: userHandle } = await getUserProfile();

  const id = params.post;
  const postFetchResult = await fetchPost(lens, { post: id });

  if (!postFetchResult) return <ErrorPage error="Couldn't find post to show" />;
  if (postFetchResult.isErr()) {
    console.error("Failed to fetch post");
    return <ErrorPage error="Couldn't find post to show" />;
  }

  const post = postFetchResult.value;

  if (post?.__typename === "Repost" || post?.metadata?.__typename === "EventMetadata" || !post) {
    return null;
  }

  if (post?.app?.metadata?.name !== "fountain") {
    const markdown = "content" in post.metadata ? post?.metadata?.content : "";

    return <Markdown content={markdown} />;
  }

  if (post.app.metadata.name === "fountain") {
    if (post.metadata.__typename !== "ArticleMetadata") {
      return null;
    }

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

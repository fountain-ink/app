import { EditorReadTime } from "@/components/editor/addons/editor-read-time";
import Editor from "@/components/editor/editor";
import ErrorPage from "@/components/misc/error-page";
import { AuthorView } from "@/components/user/user-author-view";
import { getLensClient } from "@/lib/lens/client";
import { fetchPost } from "@lens-protocol/client/actions";
import { sanitize } from "isomorphic-dompurify";

const post = async ({ params }: { params: { user: string; post: string } }) => {
  const lens = await getLensClient();
  const id = params.post;
  const post = await fetchPost(lens, { post: id }).unwrapOr(null);

  if (!post) return <ErrorPage error="Couldn't find post to show" />;

  if (post?.__typename === "Repost" || post?.metadata?.__typename === "EventMetadata" || !post) {
    return null;
  }

  // if (post?.app?.metadata?.name !== "fountain") {
  //   const markdown = "content" in post.metadata ? post?.metadata?.content : "";

  //   return <Markdown content={markdown} />;
  // }

  //// FIXME: Add app metadata check

  if (post.metadata.__typename !== "ArticleMetadata") {
    return null;
  }

  const contentJson = post?.metadata?.attributes?.find((attr: any) => attr.key === "contentJson")?.value;
  const contentHtml = post?.metadata?.attributes?.find((attr: any) => attr.key === "contentHtml")?.value;

  if (contentJson) {
    return (
      <div>
        <div className="flex flex-col gap-4 items-center justify-center">
          <EditorReadTime content={contentJson} />
          {/* <DateLabel /> */}
          <AuthorView showUsername={false} accounts={[post.author]} />
        </div>
        <Editor showToc value={contentJson} readOnly={true} />
      </div>
    );
  }

  if (contentHtml) {
    return (
      <div
        // biome-ignore lint/security/noDangerouslySetInnerHtml: intended use
        dangerouslySetInnerHTML={{ __html: sanitize(contentHtml) }}
      />
    );
  }

  return <ErrorPage error="Couldn't find content to show" />;
};

export default post;

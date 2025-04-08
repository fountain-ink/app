import { CommentPreview } from "@/components/comment/comment-preview";
import { EditorReadTime } from "@/components/editor/addons/editor-read-time";
import Editor from "@/components/editor/editor";
import ErrorPage from "@/components/misc/error-page";
import { PostActionsBar } from "@/components/post/post-actions-bar";
import PostDeletedView from "@/components/post/post-deleted-view";
import { AuthorView } from "@/components/user/user-author-view";
import { UserPostCard } from "@/components/user/user-post-card";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccountStats, fetchPost } from "@lens-protocol/client/actions";
import DOMPurify from "isomorphic-dompurify";

const post = async ({ params }: { params: { user: string; post: string } }) => {
  const lens = await getLensClient();
  const id = params.post;
  const post = await fetchPost(lens, { post: id }).unwrapOr(null);
  const { profile } = await getUserProfile();
  const authorStats = await fetchAccountStats(lens, { account: post?.author.address }).unwrapOr(null);

  if (!post) return <ErrorPage error="Couldn't find post to show" />;

  if (post?.__typename === "Repost" || post?.metadata?.__typename === "EventMetadata" || !post) {
    return null;
  }

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
          <AuthorView showUsername={false} accounts={[post.author]} />
        </div>
        <Editor showToc value={contentJson} readOnly={true} />
        <div className="max-w-[60ch] mx-auto py-8 px-8 sm:px-16 flex flex-col gap-10">
          <PostActionsBar post={post} />
          <UserPostCard account={post.author} stats={authorStats} />
          <CommentPreview post={post} />
        </div>
      </div>
    );
  }

  if (contentHtml) {
    return (
      <div>
        <div
          // biome-ignore lint/security/noDangerouslySetInnerHtml: intended use
          dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(contentHtml) }}
        />
      </div>
    );
  }

  return <ErrorPage error="Couldn't find content to show" />;
};

export default post;

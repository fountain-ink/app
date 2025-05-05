import { CommentPreview } from "@/components/comment/comment-preview";
import { EditorReadTime } from "@/components/editor/addons/editor-read-time";
import Editor from "@/components/editor/editor";
import { DateLabel } from "@/components/misc/date-label";
import ErrorPage from "@/components/misc/error-page";
import { PostActionsBar } from "@/components/post/post-actions-bar";
import PostDeletedView from "@/components/post/post-deleted-view";
import { FloatingActionBar } from "@/components/post/post-floating-actions-bar";
import { AuthorView } from "@/components/user/user-author-view";
import { UserPostCard } from "@/components/user/user-post-card";
import { ActionBarProvider } from "@/contexts/action-bar-context";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { getPostIdBySlug } from "@/lib/slug/get-post-by-slug";
import { formatDate } from "@/lib/utils";
import { fetchAccountStats, fetchPost } from "@lens-protocol/client/actions";
import DOMPurify from "isomorphic-dompurify";

const post = async ({ params }: { params: { user: string; post: string } }) => {
  const lens = await getLensClient();
  const username = params.user;
  const postParam = params.post;

  // First, try to look up the post by slug in our database
  const lensPostId = await getPostIdBySlug(postParam, username);

  // If we found a post ID by slug, use it; otherwise, assume the param is the actual post ID
  const postId = lensPostId || postParam;

  const post = await fetchPost(lens, { post: postId }).unwrapOr(null);
  const { profile } = await getUserProfile();

  // Only fetch author stats if we have a post
  const authorStats = post ?
    await fetchAccountStats(lens, { account: post.author.address }).unwrapOr(null) :
    null;

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
        <ActionBarProvider>
          <div className="flex flex-col gap-4 items-center justify-center">
            <DateLabel date={post.timestamp} />
            <EditorReadTime content={contentJson} />
            <div className="flex w-fit flex-row items-center gap-2">
              <AuthorView showUsername={false} accounts={[post.author]} />
              <span className=" flex flex-row gap-2 items-center text-[var(--subtitle-color)] font-[family-name:var(--subtitle-font)]">
                {" · "}
                <DateLabel date={post.timestamp} />
              </span>
            </div>
          </div>
          <Editor showToc value={contentJson} readOnly={true} />
          <div className="max-w-[60ch] mx-auto p-4 sm:p-8 md:px-16 flex flex-col gap-8 sm:gap-10">
            <PostActionsBar post={post} />
            <UserPostCard account={post.author} stats={authorStats} />
            <CommentPreview post={post} />
            <FloatingActionBar post={post} account={profile?.loggedInAs.account} />
          </div>
        </ActionBarProvider>
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

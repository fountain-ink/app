import { fetchAccount, fetchPost } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";
import { BlogHeader } from "@/components/blog/blog-header";
import { BlogTheme } from "@/components/blog/blog-theme";
import { ArticleLayout } from "@/components/navigation/article-layout";
import { GradientBlur } from "@/components/navigation/gradient-blur";
import PostDeletedView from "@/components/post/post-deleted-view";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { getBaseUrl } from "@/lib/get-base-url";
import { getLensClient } from "@/lib/lens/client";
import { generateEnhancedMetadata } from "@/lib/seo/metadata";
import { getBlogData } from "@/lib/settings/get-blog-data";
import { getPostIdBySlug } from "@/lib/slug/get-post-by-slug";

export async function generateMetadata({ params }: { params: { user: string; post: string } }) {
  const username = params.user;
  const postParam = params.post;
  const lens = await getLensClient();
  const lensPostId = await getPostIdBySlug(postParam, username);
  const postId = lensPostId || postParam;

  const profile = await fetchAccount(lens, {
    username: { localName: username },
  }).unwrapOr(null);

  const post = await fetchPost(lens, {
    post: postId,
  }).unwrapOr(null);

  if (!profile || !post || post?.__typename !== "Post") {
    return {
      title: `${params.post} - ${username}'s blog`,
      description: `@${username}'s blog post on Fountain`,
    };
  }

  const blog = await getBlogData(post.feed.group?.address || profile.address);
  const icon = blog?.icon;
  const title = "title" in post.metadata ? post.metadata.title : undefined;
  const description =
    "attributes" in post.metadata
      ? post.metadata.attributes?.find((attr) => "key" in attr && attr.key === "subtitle")?.value || blog?.about
      : blog?.about;
  const coverUrl =
    "attributes" in post.metadata
      ? post.metadata.attributes?.find((attr) => "key" in attr && attr.key === "coverUrl")?.value
      : undefined;
  const content = "content" in post.metadata ? post.metadata.content : undefined;
  const postUrl = `${getBaseUrl()}/p/${username}/${postParam}`;

  const contentExcerpt =
    !description && content
      ? content.substring(0, 200).replace(/[#*_]/g, "") + (content.length > 200 ? "..." : "")
      : undefined;

  const publishedTime = post.timestamp ? new Date(post.timestamp).toISOString() : undefined;

  const tags =
    "attributes" in post.metadata
      ? (post.metadata.attributes
          ?.filter((attr) => "key" in attr && attr.key === "tag")
          ?.map((attr) => attr.value)
          ?.filter(Boolean) as string[] | undefined)
      : undefined;

  const canonicalUrl =
    "attributes" in post.metadata
      ? post.metadata.attributes?.find((attr) => "key" in attr && attr.key === "canonicalUrl")?.value
      : undefined;

  return generateEnhancedMetadata({
    title: title || `${username}'s blog post`,
    description: description || contentExcerpt || `A blog post by @${username} on Fountain`,
    path: `/p/${username}/${postParam}`,
    customCanonical: canonicalUrl,
    ogImage: coverUrl,
    ogType: "article",
    article: {
      publishedTime,
      author: username,
      tags,
    },
    twitter: {
      card: coverUrl ? "summary_large_image" : "summary",
      creator: `@${username}`,
    },
  });
}

const UserPostLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string; post: string };
}) => {
  const lens = await getLensClient();
  const username = params.user;
  const postParam = params.post;

  const account = await fetchAccount(lens, {
    username: { localName: username },
  }).unwrapOr(null);

  const lensPostId = await getPostIdBySlug(postParam, username);
  const postId = lensPostId || postParam;

  const post = await fetchPost(lens, {
    post: postId,
  }).unwrapOr(null);

  const { account: userAccount } = await getUserAccount();
  const loggedInAccount = userAccount?.loggedInAs.account;

  if (!account) {
    console.error("Failed to fetch user profile");
    return notFound();
  }

  if (!post || post?.__typename !== "Post") {
    console.error("Failed to fetch post");
    return notFound();
  }

  const blogAddress = post.feed.group?.address || account.username?.localName;
  const settings = await getBlogData(blogAddress);
  const themeName = settings?.theme?.name;
  const customCss = settings?.theme?.customCss;
  const title = settings?.title;
  const icon = settings?.icon;

  if (post.isDeleted) {
    return (
      <BlogTheme initialTheme={themeName} customCss={customCss}>
        <BlogHeader title={title} icon={icon} username={blogAddress} />
        <ArticleLayout>
          <PostDeletedView />
        </ArticleLayout>
      </BlogTheme>
    );
  }

  return (
    <BlogTheme initialTheme={themeName} customCss={customCss}>
      <BlogHeader title={title} icon={icon} username={blogAddress} />
      <ArticleLayout>
        <GradientBlur />
        {children}
      </ArticleLayout>
    </BlogTheme>
  );
};

export default UserPostLayout;

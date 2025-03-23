import { ArticleLayout } from "@/components/navigation/article-layout";
import { Footer } from "@/components/navigation/footer";
import { GradientBlur } from "@/components/navigation/gradient-blur";
import { BlogHeader } from "@/components/user/blog-header";
import { UserTheme } from "@/components/user/user-theme";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { getBlogData } from "@/lib/settings/get-blog-data";
import { fetchAccount, fetchPost } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { user: string; post: string } }) {
  const username = params.user;
  const lens = await getLensClient();
  const profile = await fetchAccount(lens, {
    username: { localName: username },
  }).unwrapOr(null);

  const post = await fetchPost(lens, {
    post: params.post,
  }).unwrapOr(null);

  if (!profile || !post || post?.__typename !== "Post") {
    return {
      title: `${params.post} - ${username}'s blog`,
      description: `@${username}'s blog post on Fountain`,
    };
  }

  const blog = await getBlogData(post.feed.group?.address || profile.address);
  const icon = blog?.icon;

  return {
    title: `${params.post} - ${username}'s blog`,
    description: `@${username}'s blog post on Fountain`,
    icons: icon ? [{ rel: "icon", url: icon }] : undefined,
  };
}

const UserPostLayout = async ({
  children,
  params,
}: { children: React.ReactNode; params: { user: string; post: string } }) => {
  const lens = await getLensClient();
  const account = await fetchAccount(lens, {
    username: { localName: params.user },
  }).unwrapOr(null);

  const post = await fetchPost(lens, {
    post: params.post,
  }).unwrapOr(null);

  const { profile } = await getUserProfile();
  const loggedInAccount = profile?.loggedInAs.account;

  if (!account) {
    console.error("Failed to fetch user profile");
    return notFound();
  }

  if (!post || post?.__typename !== "Post") {
    console.error("Failed to fetch post");
    return notFound();
  }

  const blogAddress = post.feed.group?.address || account.address;
  const settings = await getBlogData(blogAddress);
  const themeName = settings?.theme?.name;
  const title = settings?.title;
  const icon = settings?.icon;

  return (
    <UserTheme initialTheme={themeName}>
      <BlogHeader title={title} icon={icon} username={blogAddress} />
      <ArticleLayout>
        <GradientBlur />
        {children}
        <Footer post={post} account={loggedInAccount} />
      </ArticleLayout>
    </UserTheme>
  );
};

export default UserPostLayout;

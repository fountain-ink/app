import { ArticleLayout } from "@/components/navigation/article-layout";
import { Footer } from "@/components/navigation/footer";
import { GradientBlur } from "@/components/navigation/gradient-blur";
import { BlogHeader } from "@/components/user/blog-header";
import { UserTheme } from "@/components/user/user-theme";
import { getLensClient } from "@/lib/lens/client";
import { getUserSettings } from "@/lib/settings/get-settings";
import { fetchAccount } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { user: string; post: string } }) {
  const handle = params.user;
  const lens = await getLensClient();
  const profile = await fetchAccount(lens, {
    username: { localName: handle },
  }).unwrapOr(null);

  if (!profile) {
    return {
      title: `${params.post} - ${handle}'s blog`,
      description: `@${handle}'s blog post on Fountain`,
    };
  }

  const settings = await getUserSettings(handle);
  const icon = settings?.blog?.icon;

  return {
    title: `${params.post} - ${handle}'s blog`,
    description: `@${handle}'s blog post on Fountain`,
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

  if (!account) {
    console.error("Failed to fetch user profile");
    return notFound();
  }

  const settings = await getUserSettings(account.address);
  const themeName = settings?.theme?.name;
  const title = settings?.blog?.title;
  const icon = settings?.blog?.icon;

  return (
    <UserTheme initialTheme={themeName}>
      <BlogHeader title={title} icon={icon} username={params.user} />
      <ArticleLayout>
        <GradientBlur />
        {children}
        <Footer />
      </ArticleLayout>
    </UserTheme>
  );
};

export default UserPostLayout;

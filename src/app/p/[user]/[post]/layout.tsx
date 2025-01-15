import { ArticleLayout } from "@/components/navigation/article-layout";
import { Footer } from "@/components/navigation/footer";
import { GradientBlur } from "@/components/navigation/gradient-blur";
import { BlogHeader } from "@/components/user/blog-header";
import { UserTheme } from "@/components/user/user-theme";
import { getUserSettings } from "@/lib/auth/get-user-settings";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";

const UserPostLayout = async ({
  children,
  params,
}: { children: React.ReactNode; params: { user: string; post: string } }) => {
  const lens = await getLensClient();
  const profile = await fetchAccount(lens, {
    username: { localName: params.user },
  }).unwrapOr(null);

  if (!profile) {
    console.error("Failed to fetch user profile");
    return notFound();
  }

  const settings = await getUserSettings(profile.address);
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

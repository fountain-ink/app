import { BlogHeader } from "@/components/user/blog-header";
import { UserTheme } from "@/components/user/user-theme";
import { getUserSettings } from "@/lib/auth/get-user-settings";
import { getBaseUrl } from "@/lib/get-base-url";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { user: string } }) {
  const handle = params.user;
  const title = `${handle}'s blog`;
  return {
    title,
    description: `@${handle}'s blog on Fountain`,
  };
}

const BlogLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) => {
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
      <div className="flex flex-col pt-14 md:pt-20 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
        {children}
      </div>
    </UserTheme>
  );
};

export default BlogLayout;

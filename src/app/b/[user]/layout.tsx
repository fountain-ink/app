import { BlogHeader } from "@/components/user/blog-header";
import { UserTheme } from "@/components/user/user-theme";
import { getUserSettings } from "@/lib/settings/get-settings";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { user: string } }) {
  const handle = params.user;
  const lens = await getLensClient();
  const account = await fetchAccount(lens, {
    username: { localName: handle },
  }).unwrapOr(null);

  if (!account) {
    return {
      title: `${handle}'s blog`,
      description: `@${handle}'s blog on Fountain`,
    };
  }

  const settings = await getUserSettings(account.address);
  const icon = settings?.blog?.icon;
  const blogTitle = settings?.blog?.title || `${handle}'s blog`;
  const blogDescription = settings?.blog?.about || `@${handle}'s blog on Fountain`;

  return {
    title: blogTitle,
    description: blogDescription,
    icons: icon ? [{ rel: 'icon', url: icon }] : undefined,
    openGraph: {
      title: blogTitle,
      description: blogDescription,
      ...(icon && { images: [{ url: icon, alt: `${blogTitle} icon` }] }),
    },
    twitter: {
      card: 'summary',
      title: blogTitle,
      description: blogDescription,
      ...(icon && { images: [icon] }),
    },
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
      <div className="flex flex-col pt-14 md:pt-20 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
        {children}
      </div>
    </UserTheme>
  );
};

export default BlogLayout;

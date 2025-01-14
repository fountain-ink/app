import { BlogTitle } from "@/components/user/blog-title";
import { UserTheme } from "@/components/user/user-theme";
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

async function getUserSettings(address: string) {
  const url = getBaseUrl();
  const response = await fetch(`${url}/api/users/${address}/settings`, {
    cache: "no-store",
  });

  if (!response.ok) {
    console.error("Failed to fetch user settings");
    return null;
  }

  const data = await response.json();
  return data.settings;
}

const BlogLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) => {
  const lens = await getLensClient();
  let profile = undefined;

  profile = await fetchAccount(lens, {
    username: { localName: params.user },
  }).unwrapOr(null);

  if (!profile) {
    console.error("Failed to fetch user profile");
    return notFound();
  }

  const settings = await getUserSettings(profile.address);
  const themeName = settings?.theme?.name;
  const title = settings?.blog?.title ?? `${profile.username?.localName}'s blog`;

  return (
    <UserTheme initialTheme={themeName}>
      <BlogTitle title={title} />
      <div className="flex flex-col pt-14 md:pt-20 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
        {children}
      </div>
    </UserTheme>
  );
};

export default BlogLayout;

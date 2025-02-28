import { BlogHeader } from "@/components/user/blog-header";
import { UserTheme } from "@/components/user/user-theme";
import { getLensClient } from "@/lib/lens/client";
import { getBlogData } from "@/lib/settings/get-user-metadata";
import { fetchAccount, fetchGroup } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";
import { isEvmAddress } from "@/lib/utils/address";

export async function generateMetadata({ params }: { params: { user: string } }) {
  const lens = await getLensClient();
  let profile;
  let address;
  let groupMetadata = null;
  
  if (isEvmAddress(params.user)) {
    const group = await fetchGroup(lens, {
      group: params.user,
    }).unwrapOr(null);
    
    if (!group) {
      return {
        title: `${params.user}'s blog`,
        description: `${params.user} on Fountain`,
      };
    }
    
    address = group.address;
    groupMetadata = group.metadata;
  } else {
    profile = await fetchAccount(lens, {
      username: { localName: params.user },
    }).unwrapOr(null);
    
    if (!profile) {
      return {
        title: `${params.user}'s blog`,
        description: `@${params.user}'s blog on Fountain`,
      };
    }

    address = profile.address;
  }
  
  const blog = await getBlogData(address);
  
  const username = profile?.username?.localName || params.user;
  const icon = blog?.icon || groupMetadata?.icon;
  const title = blog?.title || groupMetadata?.name || `${username}'s blog`;
  const description = blog?.about || groupMetadata?.description || 
    (profile ? `@${username}'s blog on Fountain` : `${params.user} on Fountain`);

  return {
    title,
    description,
    icons: icon ? [{ rel: "icon", url: icon }] : undefined,
    openGraph: {
      title,
      description,
      ...(icon && { images: [{ url: icon, alt: `${title} icon` }] }),
    },
    twitter: {
      card: "summary",
      title,
      description,
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
  let address;
  
  if (isEvmAddress(params.user)) {
    const group = await fetchGroup(lens, {
      group: params.user,
    }).unwrapOr(null);
    
    if (!group) {
      console.error("Failed to fetch group");
      return notFound();
    }
    
    address = group.address;
  } else {
    const profile = await fetchAccount(lens, {
      username: { localName: params.user },
    }).unwrapOr(null);
    
    if (!profile) {
      console.error("Failed to fetch user profile");
      return notFound();
    }
    
    address = profile.address;
  }
  
  const blog = await getBlogData(address);

  return (
    <UserTheme initialTheme={blog?.theme?.name}>
      <BlogHeader title={blog?.title} icon={blog?.icon} username={params.user} />
      <div className="flex flex-col mt-5 md:mt-10 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
        {children}
      </div>
    </UserTheme>
  );
};

export default BlogLayout;

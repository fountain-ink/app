import { BlogHeader } from "@/components/user/blog-header";
import { UserTheme } from "@/components/user/user-theme";
import { getLensClient } from "@/lib/lens/client";
import { fetchGroup } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isEvmAddress } from "@/lib/utils/address";

export async function generateMetadata({ params }: { params: { blog: string } }) {
  const lens = await getLensClient();
  let groupAddress: string;
  
  // Check if the param is an EVM address
  if (isEvmAddress(params.blog)) {
    groupAddress = params.blog;
  } else {
    // Look up the group address from our database
    const db = await createClient();
    const { data: blog } = await db
      .from("blogs")
      .select("address")
      .eq("handle", params.blog)
      .single();
      
    if (!blog) {
      return {
        title: "Blog not found",
        description: "The requested blog could not be found",
      };
    }
    groupAddress = blog.address;
  }

  const group = await fetchGroup(lens, {
    group: groupAddress,
  }).unwrapOr(null);

  if (!group) {
    return {
      title: "Blog not found",
      description: "The requested blog could not be found",
    };
  }

  // Get blog settings from our database
  const db = await createClient();
  const { data: blogSettings } = await db
    .from("blogs")
    .select("*")
    .eq("address", groupAddress)
    .single();

  const icon = blogSettings?.icon;
  const blogTitle = blogSettings?.title || group.metadata?.name || "Untitled Blog";
  const blogDescription = blogSettings?.about || group.metadata?.description || "A blog on Fountain";

  return {
    title: blogTitle,
    description: blogDescription,
    icons: icon ? [{ rel: "icon", url: icon }] : undefined,
    openGraph: {
      title: blogTitle,
      description: blogDescription,
      ...(icon && { images: [{ url: icon, alt: `${blogTitle} icon` }] }),
    },
    twitter: {
      card: "summary",
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
  params: { blog: string };
}) => {
  const lens = await getLensClient();
  let groupAddress: string;
  
  if (isEvmAddress(params.blog)) {
    groupAddress = params.blog;
  } else {
    const db = await createClient();
    const { data: blog } = await db
      .from("blogs")
      .select("address")
      .eq("handle", params.blog)
      .single();
      
    if (!blog) {
      return notFound();
    }
    groupAddress = blog.address;
  }

  const group = await fetchGroup(lens, {
    group: groupAddress,
  }).unwrapOr(null);

  if (!group) {
    console.error("Failed to fetch group");
    return notFound();
  }

  const db = await createClient();
  const { data: blogSettings } = await db
    .from("blogs")
    .select("*")
    .eq("address", groupAddress)
    .single();

  const themeName = (blogSettings?.metadata as { theme?: { name?: string } })?.theme?.name;
  const title = blogSettings?.title || group.metadata?.name;
  const icon = blogSettings?.icon || undefined;

  return (
    <UserTheme initialTheme={themeName}>
      <BlogHeader title={title} icon={icon} username={params.blog} />
      <div className="flex flex-col mt-5 md:mt-10 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
        {children}
      </div>
    </UserTheme>
  );
};

export default BlogLayout; 
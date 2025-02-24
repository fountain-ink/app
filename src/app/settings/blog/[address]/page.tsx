import { BlogSettings } from "@/components/settings/settings-blog";
import { getAppToken } from "@/lib/auth/get-app-token";
import { getTokenClaims } from "@/lib/auth/get-token-claims";
import { notFound } from "next/navigation";
import { getLensClient } from "@/lib/lens/client";
import { fetchGroup } from "@lens-protocol/client/actions";
import { createClient } from "@/lib/supabase/server";
import { BlogSettings as BlogSettingsType } from "@/hooks/use-blog-settings";

interface PageProps {
  params: {
    address: string;
  };
}

export default async function BlogPage({ params }: PageProps) {
  const appToken = getAppToken();
  const claims = getTokenClaims(appToken);

  if (!claims) {
    return notFound();
  }

  const client = await getLensClient();
  const result = await fetchGroup(client, {
    group: params.address,
  });

  if (result.isErr()) {
    return notFound();
  }

  const blog = result.value;
  if (!blog?.metadata) {
    return notFound();
  }

  const db = await createClient();
  const { data: blogSettings } = await db
    .from("blogs")
    .select()
    .eq("address", params.address)
    .single();

  const initialSettings: BlogSettingsType = blogSettings ? {
    ...blogSettings,
    title: blogSettings.title || "",
    about: blogSettings.about || "",
    metadata: {
      showAuthor: (blogSettings.metadata as any)?.showAuthor ?? true,
      showTags: (blogSettings.metadata as any)?.showTags ?? true,
      showTitle: (blogSettings.metadata as any)?.showTitle ?? true,
    },
  } : {
    title: blog.metadata.name || "",
    about: blog.metadata.description || "",
    address: params.address,
    owner: claims.metadata.address,
    created_at: new Date().toISOString(),
    updated_at: null,
    metadata: {
      showAuthor: true,
      showTags: true,
      showTitle: true,
    },
    icon: null,
  };

  return ( <BlogSettings blogAddress={params.address} initialSettings={initialSettings} isGroup={true} />);
} 
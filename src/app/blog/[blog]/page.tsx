import { IndexNavigation } from "@/components/navigation/index-navigation-menu";
import { Separator } from "@/components/ui/separator";
import { AuthorView } from "@/components/user/user-author-view";
import { UserContent } from "@/components/user/user-content";
import { getLensClient } from "@/lib/lens/client";
import { fetchGroup, fetchPosts, fetchPostTags } from '@lens-protocol/client/actions';
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { MainContentFocus } from "@lens-protocol/client";
import { isEvmAddress } from "@/lib/utils/address";
import { createServiceClient } from "@/lib/supabase/service";

const BlogPage = async ({ params }: { params: { blog: string } }) => {
  const lens = await getLensClient();
  let groupAddress: string;
  
  if (isEvmAddress(params.blog)) {
    groupAddress = params.blog;
  } else {
    const db = await createServiceClient();
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
    return notFound();
  }

  const feedAddress = group.feed;
  const posts = await fetchPosts(lens, {
    filter: {
      metadata: { mainContentFocus: [MainContentFocus.Article] },
      feeds: feedAddress ? [feedAddress] : undefined
    },
  }).unwrapOr(null);

  const tags = await fetchPostTags(lens, {
    filter: {
      feeds: feedAddress ? [feedAddress] : []
    }
  }).unwrapOr(null);

  const db = await createClient();
  const { data: blogSettings } = await db
    .from("blogs")
    .select("*")
    .eq("address", groupAddress)
    .single();

  const metadata = blogSettings?.metadata as { showAuthor?: boolean; showTags?: boolean; showTitle?: boolean } | null;
  const showAuthor = metadata?.showAuthor ?? true;
  const showTags = metadata?.showTags ?? true;
  const showTitle = metadata?.showTitle ?? true;
  const blogTitle = blogSettings?.title ?? group.metadata?.name;

  return (
    <>
      {showAuthor && group.owner && (
        <div className="p-4">
          <AuthorView showUsername={false} accounts={[group.owner]} />
        </div>
      )}

      {showTitle && (
        <div
          data-blog-title
          className="text-[1.5rem] sm:text-[2rem] lg:text-[2.5rem] text-center font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] font-normal font-[color:var(--title-color)] overflow-hidden line-clamp-2"
        >
          {blogTitle}
        </div>
      )}

      <Separator className="w-48 bg-primary mt-3" />
      {showTags && <IndexNavigation username={params.blog} isUserProfile={false} />}
      <div className="flex flex-col my-4 gap-4">
          <UserContent posts={[...posts?.items ?? []]} contentType="articles" profile={group.owner} isUserProfile={false} />
      </div>
    </>
  );
};

export default BlogPage; 
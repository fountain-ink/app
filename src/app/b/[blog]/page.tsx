import { Account, MainContentFocus } from "@lens-protocol/client";
import {
  fetchAccount,
  fetchAdminsFor,
  fetchGroup,
  fetchGroupMembers,
  fetchPosts,
  fetchPostTags,
} from "@lens-protocol/client/actions";
import { StructuredData } from "@/components/seo/structured-data";
import { generateCanonicalUrl } from "@/lib/seo/canonical";
import { generateBlogSchema } from "@/lib/seo/structured-data";
import { notFound } from "next/navigation";
import { BlogHeader } from "@/components/blog/blog-header";
import { BlogTheme } from "@/components/blog/blog-theme";
import { ArticleFeed } from "@/components/feed/feed-articles";
import { AuthorView } from "@/components/user/user-author-view";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { getBaseUrl } from "@/lib/get-base-url";
import { getLensClient } from "@/lib/lens/client";
import { generateEnhancedMetadata } from "@/lib/seo/metadata";
import { getBlogData } from "@/lib/settings/get-blog-data";
import { isEvmAddress } from "@/lib/utils/is-evm-address";

export async function generateMetadata({ params }: { params: { blog: string } }) {
  const lens = await getLensClient();
  let profile;
  let address;
  let groupMetadata = null;

  if (isEvmAddress(params.blog)) {
    const group = await fetchGroup(lens, {
      group: params.blog,
    }).unwrapOr(null);

    if (!group) {
      return {
        title: `${params.blog}'s blog`,
        description: `${params.blog} on Fountain`,
      };
    }

    address = group.address;
    groupMetadata = group.metadata;
  } else {
    profile = await fetchAccount(lens, {
      username: { localName: params.blog },
    }).unwrapOr(null);

    if (!profile) {
      return {
        title: `${params.blog}'s blog`,
        description: `@${params.blog}'s blog on Fountain`,
      };
    }

    address = profile.address;
  }

  const blog = await getBlogData(address);
  const username = profile?.username?.localName || params.blog;
  const icon = blog?.icon || groupMetadata?.icon;
  const title = blog?.title || groupMetadata?.name || `${username}'s blog`;
  const description =
    blog?.about ||
    groupMetadata?.description ||
    (profile ? `@${username}'s blog on Fountain` : `${params.blog} on Fountain`);

  return generateEnhancedMetadata({
    title,
    description,
    path: `/b/${params.blog}`,
    ogImage: icon,
    ogType: "website",
    twitter: {
      card: "summary",
      creator: profile?.username?.localName ? `@${profile.username.localName}` : undefined,
    },
  });
}

const BlogPage = async ({ params, searchParams }: { params: { blog: string }; searchParams?: { tag?: string; subscribe?: string } }) => {
  const lens = await getLensClient();
  const { username, address: userAddress } = await getUserAccount();
  let profile;
  let posts;
  let isGroup = false;
  let groupMembers: Account[] = [];
  let feed;
  let blogData;
  let group;
  let groupAdmins: Account[] = [];

  const selectedTag = searchParams?.tag || "";

  if (isEvmAddress(params.blog)) {
    group = await fetchGroup(lens, {
      group: params.blog,
    }).unwrapOr(null);

    if (!group) {
      return notFound();
    }

    isGroup = true;
    profile = group.owner;
    feed = group.feed;
    blogData = await getBlogData(group.address);

    const admins = await fetchAdminsFor(lens, { address: group.address }).unwrapOr(null);
    if (admins) {
      groupAdmins = admins.items.map((admin) => admin.account).filter((account) => account.address !== account.owner); // Check if the admin is a Lens account and not an EOA
    }

    const members = await fetchGroupMembers(lens, {
      group: params.blog,
    }).unwrapOr(null);

    if (members) {
      groupMembers = members.items.map((member) => member.account);
    }
  } else {
    const localName = params.blog;
    profile = await fetchAccount(lens, { username: { localName } }).unwrapOr(null);

    if (!profile) {
      return notFound();
    }

    blogData = await getBlogData(profile.address);
  }

  posts = await fetchPosts(lens, {
    filter: {
      authors: !isGroup && profile ? [profile.address] : undefined,
      metadata: { mainContentFocus: [MainContentFocus.Article] },
      feeds: feed ? [{ feed: feed.address }] : [{ globalFeed: true }],
      // tags: selectedTag ? [selectedTag] : undefined,
    },
  }).unwrapOr(null);

  const tags = await fetchPostTags(lens, {
    filter: {
      feeds: feed ? [{ feed: feed.address }] : undefined,
    },
  }).unwrapOr(null);

  const formattedTags =
    tags?.items.map((tag) => ({
      tag: tag.value,
      count: tag.total,
    })) || [];

  const showAuthor = blogData?.metadata?.showAuthor ?? true;
  const showTags = blogData?.metadata?.showTags ?? true;
  const showTitle = blogData?.metadata?.showTitle ?? true;
  const blogTitle = blogData?.title;
  const isUserBlog = username === params.blog && !isGroup;
  const isUserMemeber = groupMembers.some((member) => member.address === userAddress);
  console.log(posts);

  const blogSchema = generateBlogSchema({
    name: blogTitle || (isGroup ? group?.metadata?.name : `${profile?.username?.localName}'s blog`) || "Blog",
    description: blogData?.about || (isGroup ? group?.metadata?.description : profile?.metadata?.bio),
    url: generateCanonicalUrl(`/b/${params.blog}`),
    author: {
      name: isGroup ? group?.metadata?.name || "Group" : profile?.username?.localName || profile?.address || "",
      url:
        !isGroup && profile?.username?.localName ? generateCanonicalUrl(`/u/${profile.username.localName}`) : undefined,
    },
  });

  return (
    <BlogTheme initialTheme={blogData?.theme?.name} customCss={blogData?.theme?.customCss}>
      <StructuredData data={blogSchema} />
      <BlogHeader title={blogData?.title} icon={blogData?.icon} username={params.blog} />
      <div className="flex flex-col mt-5 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
        {showAuthor && (
          <div className="p-4">
            <AuthorView showUsername={false} accounts={isGroup ? groupAdmins : profile ? [profile] : []} />
          </div>
        )}

        {showTitle && (
          <div
            data-blog-title
            className="text-[1.5rem] sm:text-[2rem] lg:text-[2.5rem] text-center font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] font-normal font-[color:var(--title-color)] overflow-hidden line-clamp-2"
          >
            {blogTitle ?? (isGroup ? group?.metadata?.name || "Group Blog" : `${profile?.username?.localName}'s blog`)}
          </div>
        )}

        {/* <Separator className="w-48 bg-primary mt-3" /> */}

        {/* {showTags && feedAddress && formattedTags.length > 0 && (
          <BlogTagNavigation tags={formattedTags} username={params.blog} />
        )} */}
        <div className="flex flex-col my-4 gap-4">
          <ArticleFeed
            posts={[...(posts?.items ?? [])]}
            isUserProfile={isUserBlog || isUserMemeber}
            forceViewMode="single"
          />
        </div>
      </div>
    </BlogTheme>
  );
};

export default BlogPage;

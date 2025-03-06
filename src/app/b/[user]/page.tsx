import { IndexNavigation } from "@/components/navigation/index-navigation-menu";
import { Separator } from "@/components/ui/separator";
import { AuthorView } from "@/components/user/user-author-view";
import { UserContent } from "@/components/user/user-content";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount, fetchPosts, fetchPostTags, fetchGroup, fetchGroupMembers } from '@lens-protocol/client/actions';
import { notFound } from "next/navigation";
import { getBlogData } from "@/lib/settings/get-blog-metadata";
import { MainContentFocus, Account } from "@lens-protocol/client";
import { isEvmAddress } from "@/lib/utils/address";
import { BlogHeader } from "@/components/user/blog-header";
import { UserTheme } from "@/components/user/user-theme";

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

export const UserBlogPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { username } = await getUserProfile();
  let profile;
  let posts;
  let isGroup = false;
  let groupMembers: Account[] = [];
  let feedAddress;
  let blog;
  let group;

  if (isEvmAddress(params.user)) {
    group = await fetchGroup(lens, {
      group: params.user,
    }).unwrapOr(null);

    if (!group) {
      return notFound();
    }

    isGroup = true;
    profile = group.owner;
    feedAddress = group.feed;
    blog = await getBlogData(group.address);

    const members = await fetchGroupMembers(lens, {
      group: params.user,
    }).unwrapOr(null);

    if (members) {
      groupMembers = members.items.map(member => member.account);
    }
  } else {
    const localName = params.user;
    profile = await fetchAccount(lens, { username: { localName } }).unwrapOr(null);

    if (!profile) {
      return notFound();
    }

    blog = await getBlogData(profile.address);
  }

  posts = await fetchPosts(lens, {
    filter: {
      authors: !isGroup && profile ? [profile.address] : undefined,
      metadata: { mainContentFocus: [MainContentFocus.Article] },
      feeds: feedAddress ? [{ feed: feedAddress }] : [{ globalFeed: true }]
    },
  }).unwrapOr(null);
  console.log("posts", posts);


  const tags = await fetchPostTags(lens, {
    filter: {
      feeds: feedAddress ? [feedAddress] : []
    }
  }).unwrapOr(null);

  const showAuthor = blog?.metadata?.showAuthor ?? true;
  const showTags = blog?.metadata?.showTags ?? true;
  const showTitle = blog?.metadata?.showTitle ?? true;
  const blogTitle = blog?.title;
  const isUserProfile = username === params.user && !isGroup;

  return (
    <UserTheme initialTheme={blog?.theme?.name}>
      <BlogHeader title={blog?.title} icon={blog?.icon} username={params.user} />
      <div className="flex flex-col mt-5 items-center justify-center w-full max-w-full sm:max-w-3xl md:max-w-4xl mx-auto">
        {showAuthor && (
          <div className="p-4 ">
            <AuthorView
              showUsername={false}
              accounts={isGroup && groupMembers.length > 0 ? groupMembers : (profile ? [profile] : [])}
            />
          </div>
        )}

        {showTitle && (
          <div
            data-blog-title
            className="text-[1.5rem] sm:text-[2rem] lg:text-[2.5rem] text-center font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] font-normal font-[color:var(--title-color)] overflow-hidden line-clamp-2"
          >
            {blogTitle ?? (isGroup ? group?.metadata?.name || 'Group Blog' : `${profile?.username?.localName}'s blog`)}
          </div>
        )}

        <Separator className="w-48 bg-primary mt-3" />
        {showTags && <IndexNavigation username={params.user} isUserProfile={isUserProfile} />}
        <div className="flex flex-col my-4 gap-4">
          <UserContent posts={[...posts?.items ?? []]} contentType="articles" profile={profile} isUserProfile={isUserProfile} />
        </div>
      </div>

    </UserTheme>
  );
};

export default UserBlogPage;

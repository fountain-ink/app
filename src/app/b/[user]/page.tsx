import { IndexNavigation } from "@/components/navigation/index-navigation-menu";
import { Separator } from "@/components/ui/separator";
import { AuthorView } from "@/components/user/user-author-view";
import { UserContent } from "@/components/user/user-content";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount, fetchPosts } from "@lens-protocol/client/actions";
import { notFound } from "next/navigation";
import { getUserMetadata } from "@/lib/settings/get-user-metadata";
import { MainContentFocus } from "@lens-protocol/client";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const lens = await getLensClient();
  const { username } = await getUserProfile();
  const profile = await fetchAccount(lens, { username: { localName: params.user } }).unwrapOr(null);

  const posts = await fetchPosts(lens, {
    filter: {
      // apps: [appEvmAddress],
      authors: [profile?.address],
      metadata: { mainContentFocus: [MainContentFocus.Article] },
    },
  }).unwrapOr(null);

  if (!profile || !posts) {
    return notFound();
  }

  const metadata = await getUserMetadata(profile.address);
  const showAuthor = metadata?.blog?.showAuthor ?? true;
  const showTags = metadata?.blog?.showTags ?? true;
  const showTitle = metadata?.blog?.showTitle ?? true;
  const blogTitle = metadata?.blog?.title;

  const isUserProfile = username === params.user;

  return (
    <>
      {showAuthor && (
        <div className="p-4 ">
          <AuthorView showUsername={false} accounts={[profile]} />
        </div>
      )}

      {showTitle && (
        <div
          data-blog-title
          className="text-[1.5rem] sm:text-[2rem] lg:text-[2.5rem] text-center font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] font-normal font-[color:var(--title-color)] overflow-hidden line-clamp-2"
        >
          {blogTitle ?? `${profile.username?.localName}'s blog`}
        </div>
      )}

      <Separator className="w-48 bg-primary mt-3" />
      {showTags && <IndexNavigation username={params.user} isUserProfile={isUserProfile} />}
      <div className="flex flex-col my-4 gap-4">
        <UserContent posts={[...posts.items]} contentType="articles" profile={profile} isUserProfile={isUserProfile} />
      </div>
    </>
  );
};

export default UserPage;

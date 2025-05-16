import ErrorPage from "@/components/misc/error-page";
import { PageTransition } from "@/components/navigation/page-transition";
import { ProfileSettingsModal } from "@/components/settings/settings-profile";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/user/user-avatar";
import { UserBio } from "@/components/user/user-bio";
import { UserCover } from "@/components/user/user-cover";
import { UserFollowButton } from "@/components/user/user-follow";
import { UserFollowing } from "@/components/user/user-following";
import { UserUsername } from "@/components/user/user-handle";
import { UserLocation } from "@/components/user/user-location";
import { UserName } from "@/components/user/user-name";
import { UserNavigation } from "@/components/user/user-navigation";
import { UserSite } from "@/components/user/user-site";
import { BlogTheme } from "@/components/blog/blog-theme";
import { getUserAccount } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { getBlogData } from "@/lib/settings/get-blog-data";
import { fetchAccount, fetchAccountStats } from "@lens-protocol/client/actions";
import { AnimatePresence } from "motion/react";
import { notFound } from "next/navigation";
import { UserBlogsList } from "@/components/user/user-blogs-list";
import { getBlogsByOwner } from "@/lib/settings/get-blogs-by-owner";
import { Badge } from "@/components/ui/badge";

export async function generateMetadata({ params }: { params: { user: string } }) {
  const username = params.user;
  const title = `@${username} | Fountain`;
  return {
    title,
    description: `@${username} on Fountain`,
  };
}

const UserLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) => {
  const lens = await getLensClient();
  const localName = params.user.toLowerCase();
  const account = await fetchAccount(lens, {
    username: { localName },
  }).unwrapOr(null);

  if (!account) {
    console.error("Failed to fetch user profile");
    return <ErrorPage error="User not found" />;
  }

  const settings = await getBlogData(account.address);
  const themeName = settings?.theme?.name;
  const title = settings?.title;

  const { address, username } = await getUserAccount();

  const stats = await fetchAccountStats(lens, { account: account?.address }).unwrapOr(null);

  if (!account) {
    return <ErrorPage error="User not found" />;
  }

  const isUserProfile = address === account.address;

  const userBlogs = await getBlogsByOwner(account.address);

  return (
    <BlogTheme initialTheme={themeName}>
      <div className="flex flex-col items-center">
        <div className="w-screen md:max-w-4xl">
          <UserCover account={account} />
        </div>
        <div className="w-full h-8 max-w-3xl flex relative px-4">
          <UserAvatar
            size={40}
            className="transform -translate-y-[70%] bg-muted w-32 h-32 md:w-40 md:h-40 ring-4 rounded-full ring-background"
            account={account}
          />
        </div>
        <div className="w-full max-w-3xl flex flex-col">
          <div className="flex items-start justify-between px-4 mt-8">
            <div className="flex flex-col ">
              <div className="whitespace-nowrap text-ellipsis overflow-x-clip flex items-center gap-2">
                <UserName account={account} className="md:text-[42px] text-[32px] pl-1 font-normal tracking-[-0.8px] overflow-visible font-[family-name:--title-font]" />
                {!isUserProfile && account?.operations?.isFollowingMe && (
                  <Badge className="text-xs rounded-sm text-primary/70 bg-secondary/50 -mb-1 h-fit w-fit flex items-center justify-center ml-2" variant="secondary">
                    <span className="text-xs --font-geist-sans leading-tight">Follows you</span>
                  </Badge>
                )}
              </div>
              <UserUsername
                account={account}
                className="md:font-xl font-normal text-normal tracking-wide text-foreground/65"
              />
            </div>
            <div className="flex items-center gap-2">
              {isUserProfile ? (
                <ProfileSettingsModal
                  profile={account}
                  trigger={
                    <Button variant="outline" className="w-fit">
                      Edit profile
                    </Button>
                  }
                />
              ) : (
                <UserFollowButton account={account} />
              )}
            </div>
          </div>

          {account?.metadata?.bio && account?.metadata?.bio?.length > 0 && (
            <div className="p-4 pb-0 font-[family-name:--title-font] text-foreground/65">
              <UserBio profile={account} />
            </div>
          )}

          <div className="flex items-center font-[family-name:var(--title-font)] gap-4 p-4 pb-0">
            <UserFollowing stats={stats} className="" />
            <div className="flex items-center gap-4">
              <UserLocation profile={account} />
              <UserSite profile={account} />
            </div>
          </div>

          {userBlogs.length > 0 && <UserBlogsList blogs={userBlogs} />}

          <div className="p-4 pb-0 font-[family-name:var(--title-font)] border-b border-border">
            <UserNavigation username={params.user} isUserProfile={isUserProfile} />
          </div>

          {children}
        </div>
      </div>
    </BlogTheme>
  );
};

export default UserLayout;

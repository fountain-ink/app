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
import { UserTheme } from "@/components/user/user-theme";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { getUserSettings } from "@/lib/settings/get-settings";
import { fetchAccount, fetchAccountStats } from "@lens-protocol/client/actions";
import { AnimatePresence } from "framer-motion";
import { notFound } from "next/navigation";

export async function generateMetadata({ params }: { params: { user: string } }) {
  const username = params.user;
  const title = `@${username}`;
  return {
    title,
    description: `@${username}'s profile on Fountain`,
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

  const { address, username } = await getUserProfile();

  const stats = await fetchAccountStats(lens, { account: account?.address }).unwrapOr(null);

  if (!account) {
    return <ErrorPage error="User not found" />;
  }

  const isUserProfile = address === account.address;

  return (
    <UserTheme initialTheme={themeName}>
      <div className="flex md:mt-20 flex-col items-center">
        <div className="w-screen md:max-w-3xl">
          <UserCover profile={account} />
        </div>
        <div className="w-full max-w-2xl flex flex-col">
          <div className="flex justify-between px-4">
            <div className="flex flex-col relative">
              <UserAvatar
                className="absolute transform -translate-y-[80%] w-32 h-32 md:w-40 md:h-40 ring-4 rounded-full ring-background"
                account={account}
              />
              <div className="flex flex-col gap-2 mt-14 font-[family-name:--title-font]">
                <UserName profile={account} className="md:font-4xl font-normal tracking-[-0.8px] " />
                <UserUsername
                  account={account}
                  className="md:font-xl -mt-3 font-normal text-normal tracking-wide text-foreground/65"
                />
                <div className="flex items-center gap-4">
                  <UserFollowing stats={stats} className="" />
                  <div className="flex items-center gap-4">
                    <UserLocation profile={account} />
                    <UserSite profile={account} />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-4">
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
                <UserFollowButton profile={account} />
              )}
            </div>
          </div>
          <div className="p-4 font-[family-name:--title-font] text-foreground/65">
            <UserBio profile={account} />
          </div>
          <div className="p-4 pb-0 border-b border-border">
            <UserNavigation username={params.user} isUserProfile={isUserProfile} />
          </div>
          <AnimatePresence mode="wait">
            <PageTransition type="content">{children}</PageTransition>
          </AnimatePresence>
        </div>
      </div>
    </UserTheme>
  );
};

export default UserLayout;

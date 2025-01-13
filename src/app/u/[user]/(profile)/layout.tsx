import ErrorPage from "@/components/misc/error-page";
import { PageTransition } from "@/components/navigation/page-transition";
import { ProfileSettingsModal } from "@/components/settings/settings-profile-modal";
import { Button } from "@/components/ui/button";
import { SlideNav } from "@/components/ui/slide-tabs";
import { UserAvatar } from "@/components/user/user-avatar";
import { UserBio } from "@/components/user/user-bio";
import { UserCover } from "@/components/user/user-cover";
import { UserFollowButton } from "@/components/user/user-follow";
import { UserFollowing } from "@/components/user/user-following";
import { UserHandle } from "@/components/user/user-handle";
import { UserName } from "@/components/user/user-name";
import { getUserProfile } from "@/lib/auth/get-user-profile";
import { getLensClient } from "@/lib/lens/client";
import { fetchAccount, fetchAccountFeedStats, fetchAccountStats } from "@lens-protocol/client/actions";
import { AnimatePresence } from "framer-motion";
export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) {
  const lens = await getLensClient();
  const { profileId, handle: userHandle } = await getUserProfile();
  const pageHandle = `lens/${params.user}`;

  const account = await fetchAccount(lens, { username: { localName: params.user } }).unwrapOr(null);
  const stats = await fetchAccountStats(lens, { account: account?.address }).unwrapOr(null);
  console.log(stats)

  if (!account) {
    return <ErrorPage error="User not found" />;
  }

  const isUserProfile = profileId === account.address;

  return (
    <div className="flex md:mt-20 flex-col items-center">
      <div className="w-screen md:max-w-3xl">
        <UserCover profile={account} />
      </div>
      <div className="w-full max-w-2xl flex flex-col">
        <div className="flex justify-between px-4">
          <div className="flex flex-row gap-4">
            <UserAvatar
              className="transform -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 ring-4 rounded-full ring-background"
              account={account}
            />
            <div className="flex flex-col gap-2 font-[family-name:--title-font]">
              <UserName profile={account} className="mt-4 md:font-4xl font-normal" />
              <UserHandle profile={account} className="md:font-xl -mt-3 font-normal text-normal tracking-wide" />
              <UserFollowing stats={stats} />
            </div>
          </div>
          <div className="mt-4">
            {isUserProfile ? (
              <ProfileSettingsModal
                profile={account}
                trigger={
                  <Button variant="outline" className="w-fit">
                    Edit
                  </Button>
                }
              />
            ) : (
              <UserFollowButton profile={account} />
            )}
          </div>
        </div>
        <div className="-mt-14 p-4 px-8 ">
          <UserBio profile={account} />
        </div>
        <div className="p-4 pb-0 border-b border-border">
          <SlideNav
            items={[
              {
                href: `/u/${params.user}/profile`,
                label: "Articles",
              },
              {
                href: `/u/${params.user}/all`,
                label: "Activity",
              },
              {
                href: `/u/${params.user}/drafts`,
                label: "Drafts",
                isVisible: isUserProfile,
              },
            ]}
            className="w-fit "
          />
        </div>
        <AnimatePresence mode="wait">
          <PageTransition type="content">{children}</PageTransition>
        </AnimatePresence>
      </div>
    </div>
  );
}

import ErrorPage from "@/components/error-page";
import { SlideNav } from "@/components/ui/slide-tabs";
import { UserAvatar } from "@/components/user/user-avatar";
import { UserCover } from "@/components/user/user-cover";
import { UserFollowButton } from "@/components/user/user-follow";
import { UserFollowing } from "@/components/user/user-following";
import { UserHandle } from "@/components/user/user-handle";
import { UserName } from "@/components/user/user-name";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";

import { PageTransition } from "@/components/navigation/page-transition";
import { ProfileSettingsModal } from "@/components/settings/settings-profile-modal";
import { Button } from "@/components/ui/button";
import { UserBio } from "@/components/user/user-bio";
import { AnimatePresence } from "framer-motion";
export default async function UserLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) {
  const { lens, profileId } = await getAuthWithCookies();
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return <ErrorPage error="User not found" />;
  }

  const isUserProfile = profileId === profile.id;

  return (
    <div className="flex md:mt-20 flex-col items-center">
      <div className="w-screen md:max-w-3xl">
        <UserCover profile={profile} />
      </div>
      <div className="w-full max-w-2xl flex flex-col">
        <div className="flex justify-between px-4">
          <div className="flex flex-row gap-4">
            <UserAvatar
              className="transform -translate-y-1/2 w-32 h-32 md:w-40 md:h-40 ring-4 rounded-full ring-background"
              profile={profile}
            />
            <div className="flex flex-col gap-2 font-[family-name:--title-font]">
              <UserName profile={profile} className="mt-4 md:font-4xl font-normal" />
              <UserHandle profile={profile} className="md:font-xl -mt-3 font-normal text-normal tracking-wide" />
              <UserFollowing profile={profile} />
            </div>
          </div>
          <div className="mt-4">
            {isUserProfile ? (
              <ProfileSettingsModal
                profile={profile}
                trigger={
                  <Button variant="outline" className="w-fit">
                    Edit
                  </Button>
                }
              />
            ) : (
              <UserFollowButton profile={profile} />
            )}
          </div>
        </div>
        <div className="-mt-14 p-4 px-8 ">
          <UserBio profile={profile} />
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

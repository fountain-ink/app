import ErrorPage from "@/components/error-page";
import { UserAvatar } from "@/components/user/user-avatar";
import { UserContent } from "@/components/user/user-content";
import { UserCover } from "@/components/user/user-cover";
import { UserFollowButton } from "@/components/user/user-follow";
import { UserHandle } from "@/components/user/user-handle";
import { UserName } from "@/components/user/user-name";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";

const UserPage = async ({ params }: { params: { user: string } }) => {
  const { lens, profileId } = await getAuthWithCookies();
  const pageHandle = `lens/${params.user}`;
  const profile = await lens.profile.fetch({ forHandle: pageHandle });

  if (!profile) {
    return <ErrorPage error="User not found" />;
  }

  const isUserProfile = profileId === profile.id;
  return (
    <div className="flex flex-col items-center">
      <div className="w-screen md:max-w-3xl">
        <UserCover profile={profile} />
      </div>
      <div className="w-full max-w-2xl flex flex-col">
        <div className="flex justify-between px-4">
          <div className="flex flex-row gap-4">
            <UserAvatar
              className="transform -translate-y-1/2 w-40 h-40 ring-4 rounded-full ring-background"
              profile={profile}
            />
            <div className="flex flex-col gap-2">
              <UserName profile={profile} className="mt-4 md:font-4xl font-[family-name:--title-font] font-normal" />
              <UserHandle
                profile={profile}
                className="md:font-xl -mt-2 font-[family-name:--title-font] font-normal text-normal tracking-wide"
              />
            </div>
          </div>
          <div className="mt-4">
            <UserFollowButton profile={profile} />
          </div>
        </div>
        <UserContent isUserProfile={isUserProfile} contentType="all" profile={profile} />
      </div>
    </div>
  );
};

export default UserPage;

import { UserAvatar } from "@/components/user/UserAvatar";
import { UserBio } from "@/components/user/UserBio";
import { UserCover } from "@/components/user/UserCover";
import { UserFollowing } from "@/components/user/UserFollowing";
import { UserHandle } from "@/components/user/UserHandle";
import { UserName } from "@/components/user/UserName";
import { UserNavigation } from "@/components/user/UserNavigation";
import { UserSocials } from "@/components/user/UserSocials";
import { getAuthorizedClients } from "@/lib/getAuthorizedClients";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { user: string };
}) {
  const handle = params.user;
  const title = `${handle}`;
  return {
    title,
    description: `@${handle} on Fountain`,
  };
}

const UserLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) => {
  const { lens, handle: userHandle } = await getAuthorizedClients();
  const profile = await lens.profile.fetch({ forHandle: `lens/${params.user}` });
  const isUserProfile = userHandle === params.user

  if (!profile) {
    return notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center w-[100%] sm:w-[70%] mx-auto">
      <UserCover profile={profile} />
      <div className="flex flex-row w-full">
        <div className="grow w-[70%] flex-col gap-8">
          <h1 className="text-4xl font-bold p-4">
            {profile?.handle?.localName}'s blog
          </h1>
          <UserNavigation username={params.user} isUserProfile={isUserProfile} />
          {children}
        </div>
        <div className="w-[30%] p-4">
          <div className="sticky top-32 right-0 h-fit">
            <UserAvatar
              className="rounded-full ring-4 ring-background w-[100%] sm:w-[60%] h-auto aspect-square -translate-y-1/2"
              profile={profile}
            />
            <div className="-mt-[25%]">
              <UserName profile={profile} />
              <div className="mb-2">
                <UserHandle profile={profile} />
              </div>
              <UserFollowing profile={profile} />
              <UserBio profile={profile} />
              <UserSocials profile={profile} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLayout;
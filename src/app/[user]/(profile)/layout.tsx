import { UserCover } from "@/components/user/user-cover";
import { UserNavigation } from "@/components/user/user-navigation";
import { UserProfile } from "@/components/user/user-profile";
import { getAuth } from "@/lib/get-auth-clients";
import { notFound } from "next/navigation";

const UserProfileLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) => {
  const { lens, handle: userHandle } = await getAuth();
  const profile = await lens.profile.fetch({
    forHandle: `lens/${params.user}`,
  });
  const isUserProfile = userHandle === params.user;

  if (!profile) {
    return notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center w-[100%] sm:w-[70%] mx-auto">
      <UserCover profile={profile} />
      <div className="flex flex-row w-full">
        <div className="grow w-[70%] flex-col gap-8">
          <h1 className="text-4xl font-bold p-4">{profile?.handle?.localName}'s blog</h1>
          <UserNavigation username={params.user} isUserProfile={isUserProfile} />
          <div className="flex flex-col mt-4 gap-4">{children}</div>
        </div>
        <div className="w-[30%] p-4">
          <UserProfile profile={profile} />
        </div>
      </div>
    </div>
  );
};

export default UserProfileLayout;

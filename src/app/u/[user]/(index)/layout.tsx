import { UserNavigation } from "@/components/user/user-navigation";
import { getAuthWithCookies } from "@/lib/auth/get-auth-clients";
import { notFound } from "next/navigation";

const UserProfileLayout = async ({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { user: string };
}) => {
  const { lens, handle: userHandle } = await getAuthWithCookies();
  const profile = await lens.profile.fetch({
    forHandle: `lens/${params.user}`,
  });

  const isUserProfile = userHandle === params.user;

  if (!profile) {
    return notFound();
  }

  return (
    <div className="flex flex-col items-center justify-center w-[100%] sm:w-[70%] pt-20 mx-auto ">
      <div className="text-5xl p-4 font-[letter-spacing:var(--title-letter-spacing)] font-[family-name:var(--title-font)] font-[var(--title-weight)] font-[color:var(--title-color)] line-clamp-2">
        {profile?.handle?.localName} blog
      </div>
      <UserNavigation username={params.user} isUserProfile={isUserProfile} />
      <div className="flex flex-col mt-4 gap-4">{children}</div>
    </div>
  );
};

export default UserProfileLayout;
